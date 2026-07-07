from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from captum.attr import IntegratedGradients


MODEL_NAME = "chimsio/tsektxt-xlmr"
LABELS = ["suspicious", "not_suspicious"]

tokenizer = None
model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global tokenizer, model
    print("Loading model...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
    model.eval()
    print("Model ready.")
    yield
    print("Shutting down.")


app = FastAPI(title="TsekTxt Model API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def text_min_length(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Text must be at least 10 characters.")
        return v.strip()


class TokenAttribution(BaseModel):
    text: str
    start: int
    end: int
    weight: float
    direction: str


class AnalyzeResponse(BaseModel):
    label: str
    suspicious_probability: float
    not_suspicious_probability: float
    confidence: int
    tokenAttributions: list[TokenAttribution]


def run_predict(text: str) -> dict:
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    probs = torch.softmax(outputs.logits, dim=-1)[0]
    label_idx = int(torch.argmax(probs))
    return {
        "label": LABELS[label_idx],
        "suspicious_probability": float(probs[0]),      # LABEL_0 = suspicious
        "not_suspicious_probability": float(probs[1]),  # LABEL_1 = not_suspicious
        "confidence": int(max(probs).item() * 100),
    }


def run_attributions(text: str) -> list[dict]:
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    input_ids = inputs["input_ids"]
    attention_mask = inputs["attention_mask"]

    def forward_func(input_embeds):
        outputs = model(inputs_embeds=input_embeds, attention_mask=attention_mask)
        return torch.softmax(outputs.logits, dim=-1)[:, 0]  # index 0 = suspicious

    embeddings = model.roberta.embeddings.word_embeddings(input_ids)
    ig = IntegratedGradients(forward_func)
    attributions, _ = ig.attribute(embeddings, n_steps=50, return_convergence_delta=True)

    attr_scores = attributions.squeeze(0).sum(dim=-1)
    attr_scores = attr_scores / (attr_scores.abs().max() + 1e-8)
    tokens = tokenizer.convert_ids_to_tokens(input_ids[0])

    spans = []
    for token, score in zip(tokens, attr_scores.tolist()):
        if token in (tokenizer.cls_token, tokenizer.sep_token, tokenizer.pad_token):
            continue
        clean_token = token.lstrip("▁Ġ")
        if not clean_token:
            continue
        start = text.find(clean_token)
        if start == -1:
            continue
        spans.append({
            "text": clean_token,
            "start": start,
            "end": start + len(clean_token),
            "weight": round(abs(score), 4),
            "direction": "suspicious" if score > 0 else "not_suspicious",
        })

    spans.sort(key=lambda s: s["weight"], reverse=True)
    return spans[:5]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet.")

    result = run_predict(req.text)

    try:
        result["tokenAttributions"] = run_attributions(req.text)
    except Exception as e:
        print(f"Attribution error (non-fatal): {e}")
        result["tokenAttributions"] = []

    return result

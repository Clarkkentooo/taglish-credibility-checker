import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from captum.attr import IntegratedGradients


MODEL_CONFIGS = {
    "xlmr": {
        "repo": "chimsio/tsektxt-xlmr",
        "name": "XLM-RoBERTa (TsekTxt)"
    },
    "roberta_tagalog": {
        "repo": "chimsio/tsektxt-roberta-tagalog",
        "name": "RoBERTa-Tagalog"
    },
    "mbert": {
        "repo": "chimsio/tsektxt-mbert",
        "name": "mBERT"
    }
}
LABELS = ["suspicious", "not_suspicious"]

tokenizers = {}
models = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading models...")
    for key, cfg in MODEL_CONFIGS.items():
        print(f"Loading {key} ({cfg['repo']})...")
        tokenizers[key] = AutoTokenizer.from_pretrained(cfg["repo"])
        models[key] = AutoModelForSequenceClassification.from_pretrained(cfg["repo"])
        models[key].eval()
    print("All models ready.")
    yield
    tokenizers.clear()
    models.clear()
    print("Shutting down.")


app = FastAPI(title="TsekTxt Model API", lifespan=lifespan)

origins = os.environ.get(
    "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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


class ModelScore(BaseModel):
    model: str
    suspicious_probability: float
    not_suspicious_probability: float


class AnalyzeResponse(BaseModel):
    label: str
    suspicious_probability: float
    not_suspicious_probability: float
    confidence: int
    tokenAttributions: list[TokenAttribution]
    modelScores: list[ModelScore] | None = None


def run_predict(text: str) -> dict:
    # Use xlmr for primary classification and token attributions
    xlmr_inputs = tokenizers["xlmr"](text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        xlmr_outputs = models["xlmr"](**xlmr_inputs)
    xlmr_probs = torch.softmax(xlmr_outputs.logits, dim=-1)[0]
    xlmr_label_idx = int(torch.argmax(xlmr_probs))

    # Run predictions on all three models for comparison
    model_scores = []
    for key, cfg in MODEL_CONFIGS.items():
        inputs = tokenizers[key](text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = models[key](**inputs)
        probs = torch.softmax(outputs.logits, dim=-1)[0]
        model_scores.append({
            "model": cfg["name"],
            "suspicious_probability": float(probs[0]),
            "not_suspicious_probability": float(probs[1])
        })

    return {
        "label": LABELS[xlmr_label_idx],
        "suspicious_probability": float(xlmr_probs[0]),
        "not_suspicious_probability": float(xlmr_probs[1]),
        "confidence": int(max(xlmr_probs).item() * 100),
        "modelScores": model_scores,
    }


def run_attributions(text: str) -> list[dict]:
    prim_model = models["xlmr"]
    prim_tokenizer = tokenizers["xlmr"]
    inputs = prim_tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    input_ids = inputs["input_ids"]
    attention_mask = inputs["attention_mask"]

    def forward_func(input_embeds):
        outputs = prim_model(inputs_embeds=input_embeds, attention_mask=attention_mask)
        return torch.softmax(outputs.logits, dim=-1)[:, 0]  # index 0 = suspicious

    embeddings = prim_model.roberta.embeddings.word_embeddings(input_ids)
    ig = IntegratedGradients(forward_func)
    attributions, _ = ig.attribute(embeddings, n_steps=50, return_convergence_delta=True)

    attr_scores = attributions.squeeze(0).sum(dim=-1)
    attr_scores = attr_scores / (attr_scores.abs().max() + 1e-8)
    tokens = prim_tokenizer.convert_ids_to_tokens(input_ids[0])

    spans = []
    for token, score in zip(tokens, attr_scores.tolist()):
        if token in (prim_tokenizer.cls_token, prim_tokenizer.sep_token, prim_tokenizer.pad_token):
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
    if not models or not tokenizers:
        raise HTTPException(status_code=503, detail="Models not loaded yet.")

    result = run_predict(req.text)

    try:
        result["tokenAttributions"] = run_attributions(req.text)
    except Exception as e:
        print(f"Attribution error (non-fatal): {e}")
        result["tokenAttributions"] = []

    return result

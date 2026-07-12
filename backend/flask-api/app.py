from flask import Flask, jsonify, request
from flask_cors import CORS
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch
from captum.attr import IntegratedGradients

app = Flask(__name__)
CORS(app)

MODEL_NAME = "chimsio/tsektxt-xlmr"
LABELS = ["not_suspicious", "suspicious"]

print("Loading model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
model.eval()
print("Model ready.")


def predict(text: str):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    probs = torch.softmax(outputs.logits, dim=-1)[0]
    label_idx = int(torch.argmax(probs))
    return {
        "label": LABELS[label_idx],
        "suspicious_probability": float(probs[1]),
        "not_suspicious_probability": float(probs[0]),
        "confidence": int(max(probs).item() * 100),
    }


def get_token_attributions(text: str):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    input_ids = inputs["input_ids"]
    attention_mask = inputs["attention_mask"]

    def forward_func(input_embeds):
        outputs = model(inputs_embeds=input_embeds, attention_mask=attention_mask)
        return torch.softmax(outputs.logits, dim=-1)[:, 1]

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

    spans.sort(key=lambda item: item["weight"], reverse=True)
    return spans[:5]


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json(force=True)
    text = data.get("text", "").strip()

    if len(text) < 10:
        return jsonify({"error": "Text must be at least 10 characters."}), 400

    result = predict(text)

    try:
        result["tokenAttributions"] = get_token_attributions(text)
    except Exception as exc:
        print(f"Attribution error (non-fatal): {exc}")
        result["tokenAttributions"] = []

    return jsonify(result)


if __name__ == "__main__":
    app.run(port=5000, debug=False)

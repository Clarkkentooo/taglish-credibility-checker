# TsekTxt — Model Integration Audit & Fix Plan

**Scope:** This audit reviews how the trained models (`chimsio/tsektxt-xlmr` and siblings) are wired into the `tsektxt-app` codebase (`groq-API` branch), based on the repository contents as shared. It is a static code review, not a live run — verify each item still applies against the current `main`/`groq-API` branch before starting fixes, since the repo may have moved on.

**Audience:** This doc is written to be handed directly to an agentic coding tool (Claude Code, Cursor, etc.) as a work order. Each issue includes exact file paths, root cause, and a concrete fix.

---

## TL;DR — Will the model show up on the web app right now?

**Not by default.** The core `/analyze` pipeline (Next.js → FastAPI → `chimsio/tsektxt-xlmr`) is correctly wired and the label mapping is correct. But `NEXT_PUBLIC_USE_MOCK_API` defaults to `true`, so unless someone explicitly sets it to `false` **and** stands up the FastAPI backend **and** sets the right env vars (which `.env.example` currently documents incorrectly), the app only ever shows synthetic mock data — the trained model is never called.

There are also feature-completeness gaps (History/Saved/Feedback break in live mode) and a mismatch between what the UI promises (3-model comparison) and what the backend actually serves (1 model).

---

## ✅ What's already correct — don't touch these

1. **Label mapping is correct.** `fastapi-backend/main.py` maps `LABEL_0 = suspicious`, `LABEL_1 = not_suspicious`, and this is consistent with how the model was actually trained and validated (confirmed via live inference testing during training, not just dataset assumption). The `run_predict()` and `run_attributions()` functions both correctly target index 0 for "suspicious."
2. **The Integrated Gradients attribution logic** in `run_attributions()` is correctly implemented — it targets the suspicious-class logit, uses `n_steps=50`, and returns the top 5 spans by weight. Matches the IG approach the thesis specifies.
3. **The Next.js → FastAPI → Groq pipeline architecture is sound.** `src/app/api/analyze/route.ts` correctly keeps `GROQ_API_KEY` and the FastAPI backend URL server-side only — the browser never talks to either directly, which is the right security posture.
4. **Graceful Groq fallback for text analysis.** If `GROQ_API_KEY` is missing, `getGroqInterpretation()` in `route.ts` falls back to a generic summary built from the FastAPI result alone, rather than crashing. Good defensive design.

---

## 🔴 Critical issues — fix these first

### 1. Mock mode is on by default; real model is never called

**File:** `src/lib/api/analysis.ts`
```ts
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
```
Because this defaults to `true` whenever the env var is unset, any fresh clone/deploy of this app will silently run on `mockAnalyses`/`buildMockAnalysis()` synthetic data forever, never touching the trained model, with no visible error or warning to the developer.

**Fix:**
- Set `NEXT_PUBLIC_USE_MOCK_API=false` in the real deployment's environment.
- Add a visible dev-mode banner/console warning when mock mode is active, so this doesn't silently ship to production unnoticed. Suggest adding to `CheckerWorkspace.tsx` or a root layout check: if `NEXT_PUBLIC_USE_MOCK_API !== "false"`, render a small "Running in mock mode" badge.

### 2. `.env.example` documents the wrong provider and is missing a required variable

**File:** `.env.example`
```env
NEXT_PUBLIC_USE_MOCK_API=true
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
But the actual code (`src/app/api/analyze/route.ts`, `src/app/api/analyze-image/route.ts`) reads `process.env.GROQ_API_KEY`, not `GEMINI_API_KEY`. There is no `GEMINI_API_KEY` usage anywhere in the current codebase — this looks like a leftover from an earlier provider swap that was never cleaned up in the example file. Additionally, **`FLASK_API_URL`** (the variable that actually points at the FastAPI backend) is not documented in `.env.example` at all, even though both API routes depend on it:
```ts
const FASTAPI_URL = process.env.FLASK_API_URL ?? "http://127.0.0.1:8000";
```

**Fix — rewrite `.env.example` to:**
```env
NEXT_PUBLIC_USE_MOCK_API=false
GROQ_API_KEY=your_groq_api_key_here
FLASK_API_URL=http://127.0.0.1:8000
```
Also rename `FLASK_API_URL` → `FASTAPI_URL` throughout the codebase (`route.ts`, `analyze-image/route.ts`, any deployment config) for accuracy — it currently points at a FastAPI service, not Flask, and the misleading name risks someone wiring it to the wrong backend (see Issue 6 below).

### 3. History / Saved / Feedback / Delete break when mock mode is off

**Files:** `src/lib/api/analysis.ts`, `fastapi-backend/main.py`

`getAnalyses()`, `getAnalysis()`, `sendFeedback()`, and `deleteAnalysis()` all fall through to calling `/api/v1/analyses`, `/api/v1/analyses/:id`, `/api/v1/analyses/:id/feedback` on `NEXT_PUBLIC_API_BASE_URL` when not in mock mode:
```ts
export async function getAnalyses(): Promise<AnalysisResult[]> {
  if (!useMockApi) return request<AnalysisResult[]>("/api/v1/analyses");
  ...
}
```
**These endpoints do not exist anywhere in `fastapi-backend/main.py`**, which only implements `/health` and `/analyze`. Turning off mock mode makes the History, Saved, and Feedback pages error out or show empty/broken states, since there is no persistence layer at all — nothing writes analyses anywhere.

**Fix — pick one of two paths:**
- **Minimum viable for prototype/thesis demo:** Keep History/Saved/Feedback permanently mocked even when the checker itself uses the real model, by splitting `useMockApi` into two flags (e.g. `useMockAnalyze` and `useMockHistory`), so the core classification demo works live while acknowledging persistence isn't built yet.
- **Full implementation:** Add a lightweight persistence layer (SQLite via FastAPI, or a Next.js route backed by a simple DB) implementing `POST /analyses`, `GET /analyses`, `GET /analyses/:id`, `POST /analyses/:id/feedback`, `DELETE /analyses/:id`. This is a real scope decision — flag it back to the thesis team rather than having the agent silently build a database layer without sign-off.

### 4. Only one model is wired in; UI and mock data promise three

**Files:** `fastapi-backend/main.py`, `src/lib/mocks/analyses.ts`, `src/app/page.tsx`, `src/app/methodology/page.tsx`, `src/components/results/ModelComparison.tsx`

The backend hardcodes a single model:
```python
MODEL_NAME = "chimsio/tsektxt-xlmr"
```
But:
- The landing page copy says: *"Model comparison — Keeps RoBERTa-Tagalog, mBERT, and XLM-RoBERTa visible but secondary."*
- The methodology page says: *"The research context compares RoBERTa-Tagalog, mBERT, and XLM-RoBERTa to inspect consistency across model families."*
- `mockAnalyses` in `src/lib/mocks/analyses.ts` includes all three named models in every mock `modelScores` array.
- One version of `ModelScore` (`taglish-credibility-checker-main/src/types/analysis.ts`) even types `model` as a strict union: `"RoBERTa-Tagalog" | "mBERT" | "XLM-RoBERTa"`.

But the real `/api/analyze/route.ts` only ever returns:
```ts
const modelScores: ModelScore[] = [
  { model: "XLM-RoBERTa (TsekTxt)", ... }
];
```
This is a **content string that doesn't even match the strict union type** in the stricter `ModelScore` definition (`"XLM-RoBERTa (TsekTxt)"` ≠ `"XLM-RoBERTa"`) — if that stricter type is the one actually in the deployed branch, this **will fail TypeScript compilation** (`npm run typecheck` / `tsc --noEmit`) or silently produce a type error depending on strictness settings.

**Fix — two parts:**
- **Type-level fix (do this regardless):** Change `ModelScore.model` back to `string` (matching the looser `src/types/analysis.ts` variant already in the repo), not a 3-item union, since the real backend currently returns a different label string. Confirm which `types/analysis.ts` is actually the one in the deployed branch and remove the duplicate/stale copy.
- **Product decision (needs thesis-team input, don't auto-decide):** Either (a) update the FastAPI backend to load and run inference through all three Hugging Face repos (`chimsio/tsektxt-xlmr`, `chimsio/tsektxt-roberta-tagalog`, `chimsio/tsektxt-mbert`) and return all three in `modelScores`, matching what the UI already promises, or (b) update the landing/methodology copy to accurately describe that only XLM-RoBERTa is live in the deployed prototype, with the other two documented as part of the comparative research (with a link to the model training repo), not as a live in-app feature.

---

## 🟡 Structural issues — cleanup, not urgent but will cause confusion

### 5. Duplicate, partially-diverged repo trees in the shared codebase

The shared codebase contains two parallel copies of most files — one at the repo root (`src/...`) and one nested under `taglish-credibility-checker-main/src/...` — and they have **diverged**: e.g., `taglish-credibility-checker-main/src/components/checker/TextAnalysisEditor.tsx` supports image-upload analysis (`onImageAnalyze`), while the root-level `src/components/checker/TextAnalysisEditor.tsx` does not.

**Fix:** Confirm with the agent IDE which directory is actually the current live repo root (almost certainly `taglish-credibility-checker-main/` matches the real `tsektxt-app` structure based on naming), delete or archive the stale duplicate, and ensure there's only one source of truth going forward. Working across both simultaneously risks fixing a bug in one copy while the deployed copy stays broken.

### 6. Dead/conflicting Flask implementation with inverted labels

**File:** `flask-api/app.py`

This is a second, unused backend implementation that duplicates `fastapi-backend/main.py`'s job — but with the **label mapping inverted**:
```python
LABELS = ["not_suspicious", "suspicious"]
```
versus the correct, confirmed mapping in `fastapi-backend/main.py`:
```python
LABELS = ["suspicious", "not_suspicious"]
```
This file doesn't appear to be called by any current frontend code path (the `FLASK_API_URL` var, despite its name, actually points at the FastAPI service per the steering doc). But its presence is a real risk: if anyone (human or agent) later "helpfully" reconnects this file thinking it's the intended backend, predictions will silently invert.

**Fix:** Delete `flask-api/` entirely, or if kept for reference, add a large comment block at the top clearly marking it as deprecated/unused and pointing to `fastapi-backend/main.py` as the canonical implementation.

### 7. CORS is hardcoded to localhost only

**File:** `fastapi-backend/main.py`
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    ...
)
```
This is correct for local dev but will silently block all requests once the frontend is deployed to a real domain (Vercel, etc.) and the backend to Render/Railway.

**Fix:** Move `allow_origins` to an environment variable, populated with the production frontend URL at deploy time, e.g.:
```python
import os
origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
```

---

## 🟢 Lower priority / production hardening (optional, not blocking)

- **No auth or rate limiting** on the FastAPI `/analyze` endpoint — fine for a thesis demo, worth a one-line note in the deployment README if this goes any further.
- **Model loads on every backend cold start** (`lifespan` handler in `main.py`) — acceptable for a single small prototype instance; would need a warm-instance or caching strategy if traffic grew.
- **`requirements.txt` for `fastapi-backend` doesn't pin `python` version** — worth adding a `runtime.txt` or Docker base image pin if deploying to a platform sensitive to Python version drift.

---

## Recommended fix order for the Agent IDE

1. Fix `.env.example` (Issue 2) — 5 minutes, unblocks everything else.
2. Resolve the duplicate repo tree (Issue 5) — do this before making any other edits, so fixes land in the right files.
3. Delete or clearly deprecate `flask-api/` (Issue 6).
4. Fix `ModelScore` type mismatch (Issue 4, type-level part) — quick, prevents a build break.
5. Add CORS env var (Issue 7).
6. Flag Issues 3 and 4 (product-level parts) back for a decision before building anything — these are scope questions, not pure bugs.
7. Once `.env.example` is correct, do a manual end-to-end test: run `fastapi-backend` locally, set `NEXT_PUBLIC_USE_MOCK_API=false`, submit real Taglish text through the checker UI, and confirm the label/confidence/highlighted spans returned match expectations (test with an obviously fake claim and an obviously credible one, same as the earlier `predict()` sanity tests used during model training).

---

## Correct environment variables reference (for `.env.local`)

```env
NEXT_PUBLIC_USE_MOCK_API=false
GROQ_API_KEY=your_groq_api_key_here
FLASK_API_URL=http://127.0.0.1:8000
```

(Rename `FLASK_API_URL` to `FASTAPI_URL` as part of Issue 2's fix — until that rename lands, the variable above must keep the old name to match current code.)

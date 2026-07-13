# TsekTxt — Changes Made on July 13, 2026

All changes in this session stem from the [MODEL_INTEGRATION_AUDIT.md](./MODEL_INTEGRATION_AUDIT.md) work order, which identified 7 issues preventing the trained model from actually running on the web app. An additional OCR text display feature was also implemented.

---

## 🔴 Critical Fixes

### 1. API Routes Added to Root Source Tree

**Problem:** The root `src/` directory (what Next.js actually builds) had **no API routes**. The `/api/analyze` and `/api/analyze-image` server-side routes only existed inside the stale inner `taglish-credibility-checker-main/src/` directory, meaning the app could never call the real model.

**Files created:**
- `src/app/api/analyze/route.ts` — Text analysis route (Next.js → FastAPI model → Groq explanation → `AnalysisResult`)
- `src/app/api/analyze-image/route.ts` — Image analysis route (Groq OCR → FastAPI model → Groq explanation → `AnalysisResult` + `extractedText`)

Both routes use `process.env.FASTAPI_URL` (renamed from the misleading `FLASK_API_URL`).

---

### 2. `.env.example` Rewritten

**Problem:** Documented `GEMINI_API_KEY` (unused anywhere in the codebase — leftover from a provider swap) and was missing the `FLASK_API_URL` variable that the code actually reads.

**File modified:** `.env.example`

```diff
- NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
- NEXT_PUBLIC_USE_MOCK_API=true
+ # Set to "false" to use the real model backend.
+ NEXT_PUBLIC_USE_MOCK_API=false
+
+ # Groq API key for AI-powered explanations and image OCR
+ GROQ_API_KEY=your_groq_api_key_here
+
+ # FastAPI model backend URL
+ FASTAPI_URL=http://127.0.0.1:8000
```

**File created:** `.env.local` — Local environment with `NEXT_PUBLIC_USE_MOCK_API=false` and placeholder for Groq key.

---

### 3. Mock Flag Split — History/Feedback Stay Mocked

**Problem:** `getAnalyses()`, `getAnalysis()`, `sendFeedback()`, and `deleteAnalysis()` all tried to call `/api/v1/analyses/...` endpoints when mock mode was off — but **those endpoints don't exist** in the FastAPI backend (which only has `/health` and `/analyze`).

**File modified:** `src/lib/api/analysis.ts`

- `analyzeText()` respects `NEXT_PUBLIC_USE_MOCK_API` — calls the real model when `false`
- `getAnalyses()`, `getAnalysis()`, `sendFeedback()`, `deleteAnalysis()` **always use mock data** until a persistence layer is built
- Removed the unused `request()` helper and `NEXT_PUBLIC_API_BASE_URL` reference

---

### 4. `ModelScore` Type Mismatch Fixed

**Problem:** `ModelScore.model` was typed as `"RoBERTa-Tagalog" | "mBERT" | "XLM-RoBERTa"` but the real API route returns `"XLM-RoBERTa (TsekTxt)"`, which would fail TypeScript compilation.

**File modified:** `src/types/analysis.ts`

```diff
  export interface ModelScore {
-   model: "RoBERTa-Tagalog" | "mBERT" | "XLM-RoBERTa";
+   model: string;
    credibleProbability: number;
    notCredibleProbability: number;
  }
```

---

## 🟡 Structural Fixes

### 5. Duplicate Source Tree Excluded

**Problem:** Two parallel copies of most files — root `src/` and `taglish-credibility-checker-main/src/` — had diverged. TypeScript was compiling both and hitting errors in the stale inner copy.

**File modified:** `tsconfig.json`

```diff
  "exclude": [
-   "node_modules"
+   "node_modules",
+   "taglish-credibility-checker-main"
  ]
```

The `fastapi-backend/` directory was also **copied from the inner directory to the repo root** so it sits alongside `src/` as a sibling.

---

### 6. Flask API Deprecated

**Problem:** `flask-api/app.py` has an **inverted label mapping** (`LABELS = ["not_suspicious", "suspicious"]` instead of the correct `["suspicious", "not_suspicious"]`). If anyone reconnects it, predictions silently invert.

**File modified:** `taglish-credibility-checker-main/flask-api/app.py`

Added a large deprecation warning header:
```
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  ⚠️  DEPRECATED — DO NOT USE THIS FILE                                     ║
# ║  This Flask backend is SUPERSEDED by fastapi-backend/main.py (repo root).  ║
# ║  It has an INVERTED label mapping ...                                       ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
```

---

### 7. CORS Made Configurable

**Problem:** `allow_origins` was hardcoded to `["http://localhost:3000", "http://127.0.0.1:3000"]`, which silently blocks all requests when deployed to a real domain.

**File modified:** `fastapi-backend/main.py`

```diff
+ import os
+ origins = os.environ.get(
+     "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
+ ).split(",")
+
  app.add_middleware(
      CORSMiddleware,
-     allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
+     allow_origins=origins,
      allow_methods=["POST", "GET"],
      allow_headers=["*"],
  )
```

---

## 🟢 UI & Copy Updates

### 8. Mock Mode Banner

**File modified:** `src/components/checker/CheckerWorkspace.tsx`

Added a visible `MockModeBanner` component that renders above the editor when `NEXT_PUBLIC_USE_MOCK_API` is not `"false"`:

> **Mock mode active** — analysis uses synthetic data, not the trained model.

---

### 9. Landing & Methodology Page Copy Updated

**Problem:** Both pages claimed 3-model comparison (RoBERTa-Tagalog, mBERT, XLM-RoBERTa) but only XLM-RoBERTa is actually wired in.

**Files modified:**
- `src/app/page.tsx` — Changed "Model comparison" → "Model-backed analysis" with accurate description
- `src/app/methodology/page.tsx` — Changed "Compared transformer models" → "Deployed transformer model", updated step descriptions to reference real model output instead of "mock probabilities"

---

## ✨ New Feature: OCR Text Display in Editor

**Problem:** When uploading an image for OCR, the extracted text was invisible to the user — they couldn't review or edit it before analysis.

**Changes across 3 files:**

### `src/lib/api/analysis.ts`
- Added `analyzeImage()` function that calls `/api/analyze-image` in live mode or returns mock data in mock mode
- Returns `AnalysisResult & { extractedText: string }`

### `src/components/checker/TextAnalysisEditor.tsx`
- Added `onImageAnalyze` prop
- Image upload now reads the file as base64 and calls the parent's handler (real OCR) instead of inserting mocked placeholder text
- Added `useEffect` that **auto-switches from Image tab to Text tab** when OCR populates extracted text, so the user immediately sees it
- Updated UI copy to describe real OCR capabilities

### `src/components/checker/CheckerWorkspace.tsx`
- Added `runImageAnalysis()` function with toast notifications for progress/success/error
- After OCR completes: extracted text populates into the editor → user can review/edit → can re-analyze
- Wired `onImageAnalyze` prop to `TextAnalysisEditor`

**User flow:**
1. Switch to Image tab → upload a screenshot
2. Toast: "Extracting text from image…"
3. OCR extracts text → text appears in the editor (auto-switches to Text tab)
4. Toast: "Image text extracted & analyzed"
5. User can edit the text and click "Run suspiciousness check" again if desired

---

## Verification Results

| Check | Result |
|-------|--------|
| `pnpm typecheck` | ✅ Pass |
| `pnpm build` | ✅ Pass — `/api/analyze` and `/api/analyze-image` routes visible in build output |
| `pnpm test` | ✅ 17/17 tests pass across 6 test files |

---

## Files Changed Summary

| Action | File |
|--------|------|
| **NEW** | `src/app/api/analyze/route.ts` |
| **NEW** | `src/app/api/analyze-image/route.ts` |
| **NEW** | `fastapi-backend/` (copied to repo root) |
| **NEW** | `.env.local` |
| **MODIFIED** | `.env.example` |
| **MODIFIED** | `src/types/analysis.ts` |
| **MODIFIED** | `src/lib/api/analysis.ts` |
| **MODIFIED** | `src/components/checker/CheckerWorkspace.tsx` |
| **MODIFIED** | `src/components/checker/TextAnalysisEditor.tsx` |
| **MODIFIED** | `src/app/page.tsx` |
| **MODIFIED** | `src/app/methodology/page.tsx` |
| **MODIFIED** | `fastapi-backend/main.py` |
| **MODIFIED** | `tsconfig.json` |
| **MODIFIED** | `taglish-credibility-checker-main/flask-api/app.py` (deprecation notice) |

---

## Remaining Setup Steps

1. **Install Python system packages:**
   ```bash
   sudo apt install -y python3.12-venv python3-pip
   ```

2. **Get a Groq API key** from [console.groq.com](https://console.groq.com) and add it to `.env.local`

3. **Start the FastAPI backend:**
   ```bash
   cd fastapi-backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --port 8000
   ```
   (First run downloads ~1GB model from HuggingFace)

4. **Start the frontend:**
   ```bash
   pnpm dev
   ```

5. **Test at** `http://localhost:3000/checker`

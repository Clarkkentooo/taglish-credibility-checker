# TsekTxt Project Steering

## Project Overview
TsekTxt is a web-based Taglish credibility checker for Filipino social media content. It's a capstone project for BS Data Science at Adamson University.

## Tech Stack
- Frontend: Next.js 16 (App Router), TypeScript, Tailwind CSS
- Package manager: pnpm (always use `corepack pnpm`, never npm or yarn)
- Backend: FastAPI (Python) serving the XLM-RoBERTa model
- AI: Groq API (LLaMA 3.3 70B for text analysis, llama-4-scout for image OCR)
- Testing: Vitest (unit), Playwright (e2e)

## Project Structure
The Next.js app lives inside `taglish-credibility-checker-main/` subfolder.
The FastAPI backend lives in `taglish-credibility-checker-main/fastapi-backend/`.

## Running the Project
Always start two servers:
1. FastAPI (Terminal 1):
   cd taglish-credibility-checker-main/fastapi-backend
   source venv/bin/activate
   uvicorn main:app --port 8000

2. Next.js (Terminal 2):
   cd taglish-credibility-checker-main
   corepack pnpm dev

App runs at http://localhost:3000

## Environment Variables
Located at `taglish-credibility-checker-main/.env.local`:
- NEXT_PUBLIC_USE_MOCK_API=false
- GROQ_API_KEY (Groq API key — never commit this)
- FLASK_API_URL=http://127.0.0.1:8000 (points to FastAPI)

## Model Details
- Model: chimsio/tsektxt-xlmr (XLM-RoBERTa fine-tuned on Taglish)
- Label mapping: LABEL_0 = suspicious, LABEL_1 = not_suspicious (important — reversed from default)
- The model runs locally via FastAPI, Groq provides the explanation and highlights

## Git Remotes
- origin: https://github.com/dysar0321/tsek-prototype-groq-api- (Christian's repo)
- upstream: https://github.com/Clarkkentooo/taglish-credibility-checker (team repo, groq-API branch)

## Team
- Christian Dysar Nuñezca (CEO/Project Lead) — backend, API integration
- Clark Amba (CMO) — frontend, UI/UX (branch: cb/frontend-initial)
- Hans Jio Arca (CTO) — model, infrastructure
- Samantha Nicole Fernandez (CFO/COO) — documentation, testing

## Key Rules
- Never commit .env.local
- Always use pnpm, never npm
- FastAPI runs on port 8000, Next.js on port 3000
- When pushing: `git push origin main` for own repo, `git push upstream groq-API` for team repo
- Clear .next cache with `rm -rf .next` if you get stale build errors

# tsek.

Modern frontend for an explainable Taglish election-content credibility checker.

`tsek.` helps users review Taglish or Filipino-English election-related content before sharing. It presents automated credibility signals, model confidence, influential phrases, and responsible-use guidance without claiming to perform definitive fact-checking.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vitest and React Testing Library
- Playwright
- Mock API boundary ready for a future backend

## Scripts

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

## Environment

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_API=true
```

The frontend currently runs in mock mode. Backend integration should replace the services in `src/lib/api` while preserving the typed contract in `src/types/analysis.ts`.

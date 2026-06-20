# Codex Prompt — Build the Taglish Credibility Checker Frontend

You are a senior product designer and frontend engineer. Create a production-quality, responsive frontend for a new web application named **`tsek.`** with the descriptor **Taglish Credibility Checker** and the tagline **Think before you share.** The name is a working brand, so centralize all brand strings and tokens for easy replacement.

Before coding, read:

- `README.md`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/UI_RESEARCH.md`

## Repository and GitHub setup

This must become a new private GitHub repository on the authenticated account:

- Owner: `Clarkkentooo`
- Repository: `taglish-credibility-checker`
- Default branch: `main`
- Visibility: private
- Description: `Modern frontend for an explainable Taglish election-content credibility checker.`

If the current folder is not already connected to that repository:

1. Initialize Git with `main` as the default branch.
2. Create the private GitHub repository using the authenticated GitHub CLI or available GitHub integration.
3. Add `origin`.
4. Commit the initial frontend.
5. Push `main`.

Do not overwrite or reuse another repository. If repository creation is unavailable, finish the local implementation, print the exact command needed to create/push it, and do not silently use a different repository.

## Product context

This web app supports a capstone research project that compares **RoBERTa-Tagalog, mBERT, and XLM-RoBERTa** for classifying Taglish election-related content as credible or not credible. It also surfaces influential political entities, candidate references, election terms, informal Taglish expressions, and linguistic patterns.

The interface must not claim that the system performs a definitive fact-check. It estimates credibility from language patterns. It may be wrong and must direct users to reliable sources and human verification.

## Inspiration and originality

Use the workflow familiarity of Grammarly and QuillBot, plus modern SaaS/editor patterns found on Dribbble and Behance. Review the sources in `docs/UI_RESEARCH.md`.

Borrow only principles:

- clear editor-first workflow;
- result panel beside or beneath the editor;
- confidence and explanation instead of a bare verdict;
- highlighted passages with contextual feedback;
- history and account navigation kept secondary;
- clean spacing and responsive information hierarchy.

Do **not** clone their branding, colors, navigation, wording, illustrations, or exact component layouts. The final design must look original and specifically made for a Filipino credibility-checking product.

## Technical stack

Use:

- latest stable Next.js with App Router;
- TypeScript with strict mode;
- Tailwind CSS;
- shadcn/ui components where useful;
- Lucide React icons;
- React Hook Form and Zod;
- CSS variables/design tokens;
- Vitest and React Testing Library;
- Playwright for the main user flow;
- `pnpm` as the package manager.

Use lightweight CSS transitions or Framer Motion only when animation improves comprehension. Respect reduced-motion preferences. Do not add a heavy state-management library unless the implementation truly needs it.

## Architecture

Use a maintainable feature-oriented structure similar to:

```text
src/
  app/
    (marketing)/
    (auth)/
    dashboard/
  components/
    ui/
    layout/
    checker/
    results/
    history/
    marketing/
  features/
    analysis/
    history/
    feedback/
  lib/
    api/
    mocks/
    utils/
  config/
    brand.ts
    navigation.ts
  types/
  test/
```

Create a typed API/service boundary. The frontend must work fully with mock data now and be easy to connect to a Python/FastAPI or similar backend later.

Use:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_API=true
```

Do not implement an NLP model in JavaScript and do not fabricate real source verification.

## Brand and visual system

Build an original modern-minimalist identity.

### Direction

- calm, trustworthy, neutral, editorial, useful;
- Filipino-local without clichés or flag-heavy decoration;
- serious enough for educators and journalists, approachable enough for everyday social-media users;
- generous whitespace, thin borders, soft shadows, restrained radii;
- light theme first, dark theme optional but complete if included.

### Suggested tokens

- Ink: `#142033`
- Canvas: `#F7F9FC`
- Surface: `#FFFFFF`
- Primary indigo: `#4257D6`
- Credible teal: `#148A7A`
- Caution amber: `#C67A12`
- Not-credible coral: `#C9505F`
- Muted text: `#667085`
- Border: `#E4E8F0`

Adjust these to pass WCAG AA. Do not use status color as the only cue. Avoid partisan red/blue framing and avoid a generic neon-purple AI aesthetic.

Use Geist Sans or Inter. Keep the type scale disciplined. Use sentence case, not excessive all caps.

## Copy style

The voice must be calm, concise, neutral, and non-accusatory.

Examples:

- Hero: **Check Taglish content before you share.**
- Supporting copy: **See credibility signals, influential phrases, and model confidence in seconds.**
- Main action: **Analyze credibility**
- Input placeholder: **Paste a Taglish election-related post, caption, or thread excerpt…**
- Credible: **Likely credible**
- Not credible: **Likely not credible**
- Low-confidence state: **Needs more context**
- Disclaimer: **This result is an automated estimate based on language patterns. It does not verify every factual claim or replace reliable sources and human fact-checking.**

Never use “proven true,” “definitely fake,” “lie detected,” or similar definitive language.

## Build these routes

### Marketing

1. `/`
2. `/methodology`
3. `/privacy`

### Authentication mock screens

4. `/sign-in`
5. `/sign-up`

### Application

6. `/dashboard`
7. `/dashboard/checker`
8. `/dashboard/history`
9. `/dashboard/history/[id]`
10. `/dashboard/settings`

Authentication can be mocked. Use a clear guest demo path. Do not build an admin area in this milestone.

## Landing page

Create a polished landing page with:

1. Compact sticky header.
2. Hero with headline, supporting copy, primary CTA, secondary methodology link, and an actual checker/result interface preview.
3. A short value row for Taglish-aware analysis, explainable signals, and model comparison.
4. Three-step “Paste, analyze, understand” section.
5. Interactive example showing highlighted influential phrases and a result summary.
6. Use cases for everyday users, educators/students, and journalists/researchers.
7. A prominent but calm “Use results responsibly” section.
8. Minimal footer.

Do not use fake logos, user counts, testimonials, awards, accuracy percentages, press coverage, or unsupported claims.

## Application shell

Create a compact desktop sidebar with:

- Overview
- New analysis
- History
- Methodology
- Settings

Include a collapsible mode that remains accessible. On mobile, use a top bar plus drawer or bottom navigation. Keep the main checker visually dominant.

## Checker workspace

### Desktop composition

Use a refined two- or three-zone layout:

- navigation shell;
- central editor/input area;
- right result/analysis panel.

The layout can become resizable only if it remains simple and stable.

### Input/editor

Include:

- large plain-text editor;
- word and character counts;
- “Load sample,” “Clear,” and file-upload actions;
- visual upload support for `.txt` and `.docx` with a mocked parser state;
- minimum-text guidance;
- disabled, hover, focus, loading, success, and error states;
- sticky Analyze button on small screens.

Do not add URL scraping in the first version.

### Analysis loading experience

Use a brief progressive loading state with steps such as:

1. Checking language patterns
2. Comparing model predictions
3. Preparing explanations

Keep the total mock duration short and make it skippable in tests.

## Result experience

Create realistic mock results based on the types in `docs/PRODUCT_REQUIREMENTS.md`.

### Result summary

Show:

- Likely credible / Likely not credible / Needs more context
- confidence percentage
- one-sentence interpretation
- model agreement, such as “3 of 3 models lean not credible”
- timestamp and analysis ID in secondary text

Use a readable progress ring or horizontal confidence bar; avoid decorative gauges.

### Highlighted source text

Render the original text with clickable highlighted spans. Each span must include:

- category;
- impact direction;
- relative weight;
- plain-language explanation.

Support categories:

- Political entity
- Election term
- Informal Taglish expression
- Linguistic pattern

The detail can appear in a popover on desktop and a bottom sheet on mobile. Use more than color to distinguish highlights.

### Key factors

Show the top factors as compact rows/cards with:

- phrase;
- category icon;
- impact strength;
- explanation;
- credible/not-credible direction.

### Advanced model comparison

Keep this collapsed by default for general users. When opened, show horizontal probability bars for:

- RoBERTa-Tagalog
- mBERT
- XLM-RoBERTa

Add a tooltip explaining that model agreement strengthens consistency but does not prove factual truth.

### Limitation notice

Keep a visible responsible-use notice near the summary. Include a Methodology link.

### Feedback

Add:

- Helpful
- Not helpful
- Report an incorrect result

The report dialog should allow an optional corrected label and note. In mock mode, show an accessible success toast.

## Dashboard

Create:

- greeting and “New analysis” action;
- recent analysis cards/table;
- total analysis count;
- likely credible count;
- likely not credible count;
- needs-context count;
- simple 7-day activity visualization only if it adds clarity.

All statistics must be labeled “Demo data” while mocks are active.

## History

Build a responsive history experience with:

- text search;
- result filter;
- date filter;
- sort by newest, oldest, and confidence;
- desktop table and mobile cards;
- actions: Open, Rename, Duplicate text, Delete;
- empty, loading, and error states;
- deletion confirmation dialog.

## Methodology page

Explain in plain language:

- what the checker does;
- what Taglish means in this project;
- the three compared transformer models;
- why model interpretability is included;
- what influential phrases mean;
- that correlation/influence is not proof of factual causation;
- limitations, including false positives and the need for human verification;
- privacy behavior in mock mode.

Use diagrams made from HTML/CSS/SVG primitives rather than stock AI illustrations.

## Settings

Include:

- profile mock fields;
- appearance setting;
- language setting marked as English now / Filipino planned unless both are implemented fully;
- history/data deletion controls;
- mock mode badge in development.

## Components to create

At minimum:

- `BrandLogo`
- `MarketingHeader`
- `AppSidebar`
- `MobileNavigation`
- `TextAnalysisEditor`
- `AnalysisProgress`
- `ResultSummaryCard`
- `ConfidenceIndicator`
- `HighlightedText`
- `HighlightLegend`
- `FactorList`
- `ModelComparison`
- `ResponsibleUseNotice`
- `FeedbackDialog`
- `HistoryTable`
- `HistoryCard`
- `EmptyState`
- `ErrorState`
- `Skeleton` states

Do not create giant components. Prefer reusable, typed, testable pieces.

## Mock data

Create at least six analyses covering:

- likely credible with high agreement;
- likely not credible with high agreement;
- low-confidence needs-context presentation;
- mixed model predictions;
- a short-text validation state;
- an analysis error state.

Use fictional or generic political references such as “Candidate A,” “local election office,” and “official results.” Avoid writing realistic defamatory claims about real people.

## Accessibility

Target WCAG 2.2 AA:

- keyboard access for every control and highlighted span;
- visible focus states;
- semantic landmarks and headings;
- form labels and descriptions;
- status announcements through live regions;
- non-color status cues;
- reduced-motion support;
- 44×44 px touch targets;
- correct modal focus management;
- sufficient contrast in both themes.

## Responsive behavior

Manually verify:

- 1440 px desktop
- 1024 px laptop/tablet landscape
- 768 px tablet
- 390 px mobile
- 360 px small mobile

No horizontal page overflow. The editor, result cards, tables, dialogs, and highlighted-text explanations must remain usable at every breakpoint.

## Testing

Add tests for:

1. Landing CTA opens the checker.
2. Text validation and character count.
3. Mock analysis flow from input to result.
4. Result summary labels and disclaimer.
5. Highlight interaction by keyboard.
6. Advanced model comparison disclosure.
7. History search/filter.
8. Feedback dialog.
9. Mobile navigation in Playwright.

Add scripts for:

- `pnpm dev`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`

## Quality constraints

- No lorem ipsum.
- No broken buttons or dead navigation.
- No fake backend calls.
- No unsupported product claims.
- No copied commercial assets.
- No huge gradients or excessive glass effects.
- No hardcoded brand strings scattered throughout the app.
- No `any` types unless strictly justified.
- No console errors or hydration warnings.
- No layout shifts during the main flow.

## Final verification

Before finishing:

1. Run formatting, linting, type checking, unit tests, end-to-end tests, and production build.
2. Fix all errors and important warnings.
3. Review the app at all required viewport widths.
4. Confirm that the result language is probabilistic and neutral.
5. Confirm that demo statistics and mock data are clearly labeled.
6. Confirm that all Git changes are committed.
7. Push the `main` branch to `Clarkkentooo/taglish-credibility-checker` when GitHub access is available.
8. Return a concise implementation summary, route list, test results, and any deliberate limitations.

# Product Requirements

## 1. Product summary

The Taglish Credibility Checker is a web application that helps users evaluate whether Taglish election-related text contains credibility or misinformation signals. It is based on a comparative NLP research project using RoBERTa-Tagalog, mBERT, and XLM-RoBERTa, with model interpretability through influential-token analysis.

The frontend must make a technical model understandable to ordinary users without oversimplifying it into a misleading “true/false” badge.

## 2. Primary users

1. Filipino social-media users who want to check a post before sharing it.
2. Students and educators working on media and information literacy.
3. Journalists, researchers, and fact-checkers who want a fast screening tool.
4. Content reviewers who need a clear record of prior analyses.

## 3. User problems

- Existing detection tools are often English-first and poorly suited to Taglish.
- A binary verdict alone is difficult to trust.
- Users need to know which phrases influenced the result.
- Political interfaces can look partisan if colors, labels, or wording are careless.
- Users need a clear warning that automated detection is only one input to verification.

## 4. Product principles

- **Neutral:** Do not favor political colors, candidates, parties, or narratives.
- **Explainable:** Show confidence, model agreement, influential phrases, and factor categories.
- **Calm:** Avoid alarming language and oversized red warnings.
- **Fast:** The primary action must be reachable immediately.
- **Local:** Use clear English with selective Taglish helper copy; support a future Filipino language mode.
- **Honest:** Never claim verified accuracy, live fact-checking, or source validation unless supplied by the backend.

## 5. Primary flow

1. User opens the checker.
2. User pastes or types Taglish text, loads a sample, or selects an allowed text document.
3. User clicks **Analyze credibility**.
4. A progress state explains the steps: language check, model analysis, and explanation preparation.
5. The result view shows:
   - likely classification;
   - confidence percentage;
   - whether the models agree;
   - highlighted influential phrases;
   - factor categories and explanations;
   - optional advanced model breakdown;
   - limitation notice;
   - feedback action.
6. Signed-in users can save, revisit, rename, filter, and delete analyses.

## 6. Classification presentation

The underlying research task is binary: `credible` or `not_credible`.

The UI must use these presentation states:

- **Likely credible** — positive result with confidence.
- **Likely not credible** — cautionary result with confidence.
- **Needs more context** — used when confidence or model agreement is low; this is a UI uncertainty state, not a third model class.

Use “likely,” “signals,” and “confidence.” Do not use “proven true,” “fake,” “lie,” or “guaranteed misinformation.”

## 7. Pages

### Public

- `/` — landing page
- `/checker` — main credibility workspace
- `/methodology` — plain-language explanation of models, data, interpretability, limitations, and responsible use
- `/privacy` — privacy placeholder with no invented legal claims
- `/sign-in`
- `/sign-up`

### Authenticated application shell

- `/dashboard` — recent analyses and quick start
- `/dashboard/checker` — full checker workspace
- `/dashboard/history` — searchable and filterable analysis history
- `/dashboard/history/[id]` — saved analysis result
- `/dashboard/settings` — profile, appearance, language placeholder, and data controls

Do not build an admin dashboard in the first frontend milestone.

## 8. Landing page sections

1. Minimal navigation with product wordmark, How it works, Methodology, Sign in, and primary CTA.
2. Hero with a compact checker preview rather than a generic illustration.
3. Trust/value row: Taglish-aware, explainable signals, model comparison, privacy-conscious wording.
4. Three-step workflow.
5. Interactive result preview with highlighted phrases.
6. Audience/use cases.
7. Responsible-use limitation section.
8. Final CTA and simple footer.

Avoid fake customer logos, testimonials, usage counts, accuracy claims, and awards.

## 9. Checker workspace layout

### Desktop

- Slim application sidebar or compact top navigation.
- Main center column: text editor/input.
- Right analysis panel: result summary, confidence, model agreement, key factors.
- Advanced details can expand below or in a drawer.

### Tablet

- Editor and result panel stack or use a resizable two-column layout.

### Mobile

- Single-column flow.
- Sticky bottom Analyze button before results.
- Result summary appears first, then highlighted text, factors, and advanced model details.

## 10. Editor requirements

- Plain-text-first editor; rich formatting is not necessary.
- Placeholder: “Paste a Taglish election-related post, caption, or thread excerpt…”
- Live word and character count.
- Minimum-text guidance without blocking exploration.
- Clear button.
- Load sample button.
- File upload UI limited to `.txt` and `.docx` as a visual/frontend feature; parsing may be mocked.
- Keyboard-accessible focus states.
- No URL scraping in the first milestone.

## 11. Result UI

### Summary card

- Status label.
- Confidence percentage and semantic explanation.
- “What this means” one-sentence interpretation.
- Model agreement count, such as “3 of 3 models lean not credible.”

### Highlighted text

- Render the submitted text with weighted spans.
- Clicking a span opens an explanation popover or side detail.
- Do not rely on color alone; use underline/pattern/icon and text label.

### Factors

Group influential features into:

- Political entities and candidate references
- Election-related terms
- Informal Taglish expressions and buzzwords
- Claim or linguistic patterns

Each factor includes label, impact strength, direction, and plain-language explanation.

### Model comparison

Advanced disclosure with:

- RoBERTa-Tagalog
- mBERT
- XLM-RoBERTa

Show each model’s credible/not-credible probability using horizontal bars. Avoid implying that three similar model votes are independent proof.

### Responsible-use notice

Persistent but visually calm:

> This result is an automated estimate based on language patterns. It does not verify every factual claim or replace reliable sources and human fact-checking.

### Feedback

- Helpful / Not helpful
- “The result seems incorrect” opens a feedback dialog
- Optional reason and corrected label
- No backend required; show a success toast in mock mode

## 12. Dashboard and history

Dashboard cards:

- New analysis CTA
- Total analyses
- Recent likely credible
- Recent likely not credible
- Needs-context count

History table/list:

- Search by excerpt/title
- Filter by result state
- Filter by date
- Sort newest/oldest/confidence
- Responsive card list on mobile
- Overflow menu: Open, Rename, Duplicate text, Delete

Use realistic sample data and clearly mark it as demonstration data.

## 13. Brand direction

### Working identity

- Wordmark: `tsek.` in lowercase
- Product descriptor: Taglish Credibility Checker
- Tagline: Think before you share.

All brand strings must live in one config file for easy replacement.

### Visual personality

- Modern, minimalist, calm, trustworthy, editorial, locally relevant.
- Avoid generic neon-purple “AI” branding.
- Avoid partisan red-versus-blue composition.
- Use generous whitespace, strong typography, thin borders, and subtle elevation.

### Suggested palette

- Ink: `#142033`
- Canvas: `#F7F9FC`
- Surface: `#FFFFFF`
- Primary indigo: `#4257D6`
- Credible teal: `#148A7A`
- Caution amber: `#C67A12`
- Not-credible coral: `#C9505F`
- Muted text: `#667085`
- Border: `#E4E8F0`

Check and adjust all combinations to meet WCAG AA. Do not communicate status through color alone.

### Typography

Use `Geist Sans` or `Inter` throughout. Prefer one font family and a restrained type scale.

## 14. Mock frontend data contract

```ts
export type AnalysisStatus = "credible" | "not_credible" | "uncertain";

export interface ModelScore {
  model: "RoBERTa-Tagalog" | "mBERT" | "XLM-RoBERTa";
  credibleProbability: number;
  notCredibleProbability: number;
}

export interface HighlightedSpan {
  id: string;
  start: number;
  end: number;
  text: string;
  category:
    | "political_entity"
    | "election_term"
    | "taglish_expression"
    | "linguistic_pattern";
  direction: "credible" | "not_credible";
  weight: number;
  explanation: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  sourceText: string;
  status: AnalysisStatus;
  confidence: number;
  modelAgreement: 1 | 2 | 3;
  modelScores: ModelScore[];
  highlightedSpans: HighlightedSpan[];
  summary: string;
  disclaimer: string;
}
```

Prepare a service layer for:

- `POST /api/v1/analyze`
- `GET /api/v1/analyses`
- `GET /api/v1/analyses/:id`
- `POST /api/v1/analyses/:id/feedback`
- `DELETE /api/v1/analyses/:id`

Use a `NEXT_PUBLIC_USE_MOCK_API=true` switch. Do not implement a real classification model in the frontend.

## 15. Accessibility and quality

- WCAG 2.2 AA target.
- Full keyboard navigation.
- Visible focus rings.
- Proper labels, descriptions, live regions, and error messages.
- Respect `prefers-reduced-motion`.
- Minimum touch target of 44×44 px.
- Test 1440, 1024, 768, 390, and 360 px widths.
- No horizontal page overflow.
- Loading, empty, error, and offline-like mock states.
- `pnpm lint`, `pnpm typecheck`, tests, and production build must pass.

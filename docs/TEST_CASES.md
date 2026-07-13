# TEST CASES

**Project:** TsekTxt — Taglish Credibility Checker
**Version:** v1.1
**Designed by:** Fernandez, Samantha Nicole
**Date:** July 13, 2026

---

## Pre-conditions

- Web application running at http://localhost:3000
- FastAPI backend running at http://127.0.0.1:8000 serving chimsio/tsektxt-xlmr
- Integrated Gradients attribution enabled (Captum)
- Groq vision (image OCR) and Groq LLaMA 3.3 (interpretation only) configured
- User is on the home page

**Dependencies:** Next.js frontend, FastAPI backend (port 8000), HuggingFace model chimsio/tsektxt-xlmr, PyTorch + Transformers + Captum, Groq API, internet connection

---

## TEXT ANALYSIS

### TC-001 — Valid Taglish Text: Not Suspicious

**Summary:** Verify a factual Taglish statement is classified as Not Suspicious.

**Steps:**
1. Open the checker workspace
2. Paste: "Ayon sa opisyal na pahayag ng COMELEC, magiging bukas ang mga polling precincts sa Mayo 12, 2025 mula 6AM hanggang 7PM."
3. Click the Submit button
4. Observe the results panel

**Expected Result:** Results panel shows "Not Suspicious" verdict with a confidence score. Integrated Gradients token highlights are displayed.

**Priority:** High
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending

---

### TC-002 — Valid Taglish Text: Suspicious

**Summary:** Verify content with hearsay markers is classified as Suspicious.

**Steps:**
1. Open the checker workspace
2. Paste: "May kumakalat na balita na daw ipagpapaliban ang eleksyon, pero wala pang kumpirmasyon mula sa opisyal na tanggapan."
3. Click Submit
4. Observe the results panel

**Expected Result:** Results panel shows "Suspicious" verdict with a confidence score and token highlights.

**Priority:** High
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending
**Notes:** Use a pre-labeled Suspicious sample from the dataset.

---

### TC-003 — Empty Text Submission

**Summary:** Verify that submitting an empty text field shows a validation error and does not call the API.

**Steps:**
1. Open the checker workspace
2. Leave the text field empty
3. Click Submit
4. Observe the response

**Expected Result:** System displays a validation message. The FastAPI model endpoint is NOT called. No results panel shown.

**Priority:** High
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending
**Notes:** Confirm no network request in browser DevTools.

---

### TC-004 — Text Exceeding Maximum Length

**Summary:** Verify the system handles input longer than the model's 512-token limit.

**Steps:**
1. Paste a paragraph exceeding ~512 tokens
2. Click Submit
3. Observe the response

**Test Data:** A ~600-word Taglish paragraph

**Expected Result:** System truncates gracefully to max_length=512 and returns a verdict, or shows a clear length notice. No crash.

**Priority:** High
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending

---

### TC-005 — English-Only Text

**Summary:** Verify the system processes English-only text without errors.

**Steps:**
1. Paste: "The Philippine government announced a new infrastructure project worth 10 billion pesos."
2. Click Submit
3. Observe the results panel

**Expected Result:** System returns a verdict and confidence score. No error.

**Priority:** Medium
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending
**Notes:** XLM-RoBERTa is multilingual — verify it does not error out.

---

### TC-006 — Filipino-Only Text

**Summary:** Verify the system processes Filipino-only text without errors.

**Steps:**
1. Paste: "Ayon sa balita, maraming tao ang naapektuhan ng bagyo sa probinsya."
2. Click Submit
3. Observe the results panel

**Expected Result:** System returns a verdict and confidence score. No error.

**Priority:** Medium
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending

---

## RESULTS DISPLAY & EXPLAINABILITY

### TC-007 — Verdict Label Accuracy

**Summary:** Verify the displayed verdict matches the model output.

**Steps:**
1. Submit a text with a known expected label
2. Compare the displayed verdict against the expected model output

**Test Data:** Pre-labeled Taglish sample

**Expected Result:** Displayed verdict matches the label returned by chimsio/tsektxt-xlmr.

**Priority:** High
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending
**Notes:** Cross-reference with a direct FastAPI call (see TC-012).

---

### TC-008 — Confidence Score Display

**Summary:** Verify the confidence percentage is shown and falls between 0% and 100%.

**Steps:**
1. Submit a valid Taglish text
2. Check the confidence score in the results panel
3. Verify value is between 0% and 100%

**Expected Result:** Confidence score is displayed as a percentage between 0% and 100%.

**Priority:** High
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending
**Notes:** Confidence = softmax probability of the predicted class.

---

### TC-009 — Integrated Gradients Token Highlights

**Summary:** Verify the results panel highlights the tokens that most influenced the classification.

**Steps:**
1. Submit a valid Taglish text with clear signal words (e.g., "daw", "share agad")
2. Inspect the highlighted tokens
3. Verify at least 3 tokens are highlighted

**Expected Result:** At least 3 tokens are visually highlighted, corresponding to the highest Integrated Gradients attribution weights from the XLM-RoBERTa model.

**Priority:** High
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending
**Notes:** Highlights from Integrated Gradients (Captum) computed on the fine-tuned model — not random.

---

### TC-010 — Responsible-Use Notice Displayed

**Summary:** Verify the responsible-use / disclaimer notice appears with every result.

**Steps:**
1. Submit any valid Taglish text
2. Confirm the responsible-use notice is visible with the result

**Expected Result:** Disclaimer stating the tool is an aid and not a definitive fact-checker is displayed with the result.

**Priority:** Medium
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

### TC-011 — FastAPI Model Endpoint Direct Response

**Summary:** Verify the FastAPI inference endpoint returns well-formed JSON.

**Steps:**
1. Send a POST request to `http://127.0.0.1:8000/analyze` with a text payload
2. Inspect the JSON response

**Test Data:**
```json
POST http://127.0.0.1:8000/analyze
{ "text": "<Taglish text>" }
```

**Expected Result:** HTTP 200. Response contains: `label` (suspicious/not_suspicious), `suspicious_probability`, `not_suspicious_probability`, `confidence` (0-100), and `tokenAttributions[]`.

**Priority:** High
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending
**Notes:** Grey-box cross-check of the served chimsio/tsektxt-xlmr model.

---

## AUTHENTICATION

### TC-012 — Sign-Up with Valid Credentials

**Steps:**
1. Go to the sign-up page
2. Enter a valid email and compliant password
3. Click Sign Up

**Test Data:** Email: testuser@gmail.com | Password: Test@1234

**Expected Result:** Account is created. User is redirected to the dashboard. User is authenticated and logged in.

**Priority:** Medium
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

### TC-013 — Sign-Up with Duplicate Email

**Steps:**
1. Attempt to sign up with an already-registered email

**Test Data:** Email: existing@gmail.com (already registered)

**Expected Result:** System displays an error. User remains on the sign-up page.

**Priority:** Medium
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

### TC-014 — Sign-In with Valid Credentials

**Steps:**
1. Go to the sign-in page
2. Enter valid registered credentials
3. Click Sign In

**Test Data:** Email: testuser@gmail.com | Password: Test@1234

**Expected Result:** User is authenticated and redirected to the dashboard.

**Priority:** Medium
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

### TC-015 — Sign-In with Invalid Credentials

**Steps:**
1. Go to the sign-in page
2. Enter a registered email with a wrong password
3. Click Sign In

**Test Data:** Email: testuser@gmail.com | Password: WrongPass999

**Expected Result:** System displays an error message. User is not logged in.

**Priority:** Medium
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

### TC-016 — Sign-Out Clears Session

**Steps:**
1. While logged in, click Sign Out
2. Attempt to open a protected page (e.g., /dashboard)

**Expected Result:** Session is cleared. Protected pages redirect to sign-in.

**Priority:** Medium
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

### TC-017 — Multiple Simultaneous Logins

**Steps:**
1. Log in with the same account in two separate browsers/devices
2. Perform an action in each session
3. Observe how the sessions behave

**Expected Result:** Both sessions behave per policy with no data corruption or cross-session leakage.

**Priority:** Medium
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

### TC-018 — Expired Session Handling

**Steps:**
1. Log in
2. Let the session token expire (or clear/expire it manually)
3. Attempt to open a protected page

**Expected Result:** System rejects the expired session, redirects to sign-in, and requires re-authentication.

**Priority:** Medium
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

## HISTORY

### TC-019 — Analysis Logged After Text Submission

**Steps:**
1. Log in
2. Submit a Taglish text and receive a verdict
3. Open the History page
4. Verify the entry is present

**Expected Result:** History shows the submitted text, verdict, confidence score, and timestamp.

**Priority:** Medium
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

### TC-020 — History Display and Retrieval

**Steps:**
1. Open the History page with existing entries
2. Verify list rendering and sorting
3. Open a single entry

**Expected Result:** Entries render with correct fields. Opening an entry shows its full analysis.

**Priority:** Medium
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

## UI/UX DESIGN

### TC-021 — Landing Page Renders Correctly

**Steps:**
1. Open the app root URL
2. Verify the hero, brand logo, CTA, and sections render

**Expected Result:** All landing content renders correctly with no broken layout or missing assets.

**Priority:** Low
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

### TC-022 — Navigation and Routing

**Steps:**
1. Click each nav link (Checker, Methodology, Privacy, Sign in, etc.)
2. Verify each destination loads

**Expected Result:** Every link routes to the correct page. No 404 or wrong-page errors.

**Priority:** Low
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

### TC-023 — Mobile Responsiveness

**Steps:**
1. Open the app at a 375px-wide viewport
2. Verify the checker, results, and nav adapt without overflow

**Expected Result:** Layout is responsive. Content is readable. Mobile navigation works.

**Priority:** Low
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

## PERFORMANCE & RELIABILITY

### TC-024 — Text Analysis API Response Time

**Steps:**
1. Submit a valid Taglish text (~50 words)
2. Start a timer at submission; stop when the results panel appears
3. Record the time. Run 3 times and average.

**Expected Result:** Results appear within 15 seconds of submission (local CPU inference). Record the average time for the test report.

**Priority:** Low
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending
**Notes:** Run 3 times and average. Note FastAPI + model inference latency separately.

---

### TC-025 — Repeated-Submission Consistency

**Steps:**
1. Submit the same Taglish text 5 times
2. Compare verdicts and confidence scores

**Expected Result:** Verdict is identical across runs. Confidence is stable (deterministic inference).

**Priority:** Low
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending

---

## MODEL ACCURACY

### TC-026 — Model Classification Accuracy Benchmark

**Steps:**
1. Prepare a labeled benchmark set (>= 100 Taglish samples)
2. Submit each sample or batch-call the FastAPI endpoint
3. Compare predictions to ground-truth labels
4. Compute accuracy and macro-F1

**Expected Result:** Overall accuracy >= 90% and macro-F1 >= 0.90 on the benchmark set.

**Priority:** High
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending
**Notes:** Cross-check against the model card metrics. Run via direct FastAPI calls.

---

## ACCESSIBILITY

### TC-027 — Keyboard Navigation and Visible Focus

**Steps:**
1. Load the checker workspace
2. Using only Tab / Shift+Tab / Enter / Space, navigate to the text input, submit button, and navigation links
3. Verify the focus indicator is visible and the tab order is logical

**Expected Result:** All controls are reachable and operable by keyboard. Focus is always visible. No keyboard traps. (WCAG 2.1 AA — 2.1.1, 2.4.7)

**Priority:** Low
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

### TC-028 — Screen-Reader Labels and Color Contrast

**Steps:**
1. Inspect inputs, buttons, and the results panel with VoiceOver
2. Verify labels/roles are announced, including the verdict
3. Check text and UI color-contrast ratios

**Expected Result:** All controls have accessible names/labels. The verdict is announced. Text contrast ratio >= 4.5:1. (WCAG 2.1 AA — 1.4.3, 4.1.2)

**Priority:** Low
**Assigned:** Amba, Clark (Frontend/UI)
**Status:** Pending

---

## IMAGE / OCR ANALYSIS

### TC-029 — Valid Screenshot Upload: Taglish Content

**Summary:** Verify a screenshot containing Taglish text is OCR-extracted and then classified.

**Steps:**
1. Open the checker workspace
2. Switch to Image tab
3. Upload a PNG/JPG screenshot of a Taglish social media post (< 5MB)
4. Observe OCR extraction and the classification results

**Expected Result:** Groq vision extracts the text. The extracted text is sent to the XLM-RoBERTa classifier. A verdict, confidence, and Integrated Gradients highlights are returned. The extracted text is displayed.

**Priority:** High
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending
**Notes:** Confirm the displayed extracted text matches the screenshot content.

---

### TC-030 — Unsupported File Type Upload

**Steps:**
1. Attempt to upload a .pdf or .docx file to the image upload zone
2. Observe the response

**Expected Result:** System rejects the upload with an error. No OCR or classification is performed.

**Priority:** High
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending
**Notes:** mimeType must start with "image/".

---

### TC-031 — Image with No Readable Text

**Steps:**
1. Upload an image that contains no text (e.g., a plain photograph)
2. Observe the response

**Expected Result:** System reports that not enough text was detected (needs >= 10 characters) and prompts for a clearer image. No classification is performed. System does not crash.

**Priority:** High
**Assigned:** Arca, Hans Jio (Backend/API)
**Status:** Pending
**Notes:** OCR returning < 10 characters yields HTTP 422.

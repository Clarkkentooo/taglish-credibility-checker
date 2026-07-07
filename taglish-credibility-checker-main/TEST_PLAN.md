# TEST PLAN

## Test Plan Identifier
TP-TSEKTXT-2026-001

---

## Title
TsekTxt: A Web-Based Taglish Credibility Checker for Filipino Social Media Content

---

## Introduction

TsekTxt is a web-based Taglish credibility checker developed as a capstone project for the BS Data Science program at Adamson University. The system allows Filipino users to submit Taglish social media text or upload screenshots and receive a real-time credibility classification — Not Suspicious or Suspicious — powered by a fine-tuned XLM-RoBERTa model (chimsio/tsektxt-xlmr) served via a local FastAPI backend. The Groq API with LLaMA 3.3 (70B Versatile) independently assesses credibility signals and generates human-readable explanations and token highlights. For image uploads, the Groq vision model (llama-4-scout-17b) extracts text via OCR before classification. This test plan provides a structured framework for validating the system's features, usability, and performance before final submission.

---

## Test Items

- Text input field (Taglish text submission)
- Image/screenshot upload (Groq vision OCR pipeline via `/api/analyze-image`)
- Credibility results panel (verdict, confidence score, dual model scores, token highlights)
- Sign-up and sign-in pages (user authentication)
- History page (past analysis log)
- Dashboard
- Navigation and routing between pages
- FastAPI backend inference endpoint (`http://localhost:8000/analyze`)
- Next.js API route for text analysis (`/api/analyze`)
- Next.js API route for image analysis (`/api/analyze-image`)

---

## Features to Be Tested

| Feature | Description |
|---|---|
| UI/UX Design | Layout, navigation, responsiveness |
| Text Analysis | Taglish text submission and credibility classification |
| Image Analysis | Screenshot upload, OCR extraction via Groq vision, and classification |
| Results Display | Verdict label, confidence percentage, dual model comparison, token attribution highlights |
| Authentication | Sign-up, sign-in, sign-out |
| History | Logging and retrieval of past analyses |
| Performance | API response time and system stability |
| Error Handling | Invalid inputs, empty submissions, unsupported file types |

---

## Features Not to Be Tested

- Domain expansion features (health misinformation, scam detection, disaster alerts) — not yet implemented
- Model retraining or fine-tuning pipeline — evaluated separately via Colab notebook
- Multi-language support beyond Taglish/Filipino/English
- Offline mode or PWA functionality

---

## Approach

Black Box Testing will be the primary method used to validate TsekTxt. Testers will interact with the system exclusively through its user interface without knowledge of the internal model architecture or code, focusing solely on inputs and expected outputs. Each feature will be tested by submitting defined inputs and verifying that the system returns the correct responses as specified in the test cases.

For the credibility classification feature, sample Taglish content drawn from known labeled data will be used to verify that both the XLM-RoBERTa model and the Groq LLaMA 3.3 analysis return appropriate verdicts. The dual model comparison panel will be observed to compare outputs between the two systems. Performance testing will measure API response time against the benchmarks defined in the system requirements.

---

## Item Pass/Fail Criteria

| Component | Pass | Fail |
|---|---|---|
| UI/UX Design | All pages render correctly. Navigation links route to the correct pages. Layout is responsive on both desktop and mobile viewports. | Pages fail to render or display broken layouts. Navigation links lead to wrong pages or produce 404 errors. |
| Text Analysis | Submitted Taglish text returns a credibility verdict (Not Suspicious or Suspicious) with a confidence score within 5 seconds. | System returns no verdict, displays an error, or takes longer than 5 seconds to respond. |
| Image Analysis (OCR) | Uploaded screenshot is processed by Groq vision API, text is extracted correctly, and the extracted text is passed to the classifier for a credibility verdict. | Image upload fails, no text is extracted, or the extracted text is not passed to the classifier. |
| Results Display | Results panel shows the verdict label, confidence percentage, dual model comparison scores (XLM-RoBERTa and Groq), and at least 2 highlighted tokens influencing the classification. | Results panel is blank, shows incorrect labels, or token highlights are absent. |
| Authentication | Users can register with valid credentials, log in successfully, and log out. Invalid credentials display an appropriate error message. | Valid credentials are rejected. Invalid credentials are accepted. Sign-out does not clear the session. |
| History | Each completed analysis is logged in the history page with the correct text, verdict, and timestamp. | Analyses are not logged, entries are missing fields, or history is inaccessible. |
| Error Handling | Empty submissions display a validation message. Unsupported file types are rejected with a clear error. The system does not crash on invalid inputs. | Empty submissions are processed without error. Invalid files are accepted. System crashes or returns unhandled exceptions. |
| Performance | Text analysis (Flask + Groq) responds within 10 seconds. Image OCR + classification completes within 15 seconds. | Text analysis exceeds 10 seconds. Image pipeline exceeds 15 seconds or times out. |

> Note: Response time benchmarks account for local Flask model inference on CPU, which is inherently slower than cloud-hosted inference.

---

## Suspension Criteria and Resumption Requirements

Testing will be suspended when a critical defect is discovered that blocks the core classification pipeline — such as the Flask API being unreachable, the Groq API failing to extract text from images, or the results panel failing to render verdicts. All test cases dependent on the affected component will be suspended. Testing will resume once the defect has been diagnosed, fixed, and the affected component has been retested in isolation and confirmed to be functioning correctly.

---

## Test Deliverables

- Test Plan (this document)
- Test Cases (Excel spreadsheet)
- Test Data Sets (sample Taglish texts and screenshots)
- Test Defect Reports
- Test Results
- Test Evaluation Report

---

## Testing Tasks

### UI/UX Design
- Landing page layout and content
- Checker workspace layout
- Navigation links and routing
- Mobile responsiveness
- Button functionality

### Text Analysis
- Valid Taglish text submission
- Empty text submission
- Oversized text input (>512 characters)
- English-only and Filipino-only text inputs
- Rich text / formatted text paste (bold, different fonts)

### Image Analysis (OCR)
- Valid screenshot upload with Taglish content
- Unsupported file type upload
- Image with no readable text
- Image with small or unclear text

### Results Display
- Verdict label accuracy
- Confidence score display
- Dual model comparison panel (XLM-RoBERTa vs Groq)
- Token highlight display
- Clear button resets results and highlights
- Responsible use notice

### Authentication
- Sign-up with valid credentials
- Sign-up with duplicate email
- Sign-in with valid credentials
- Sign-in with invalid credentials
- Sign-out

### History
- Analysis logging after text submission
- Analysis logging after image submission
- History page display and entry retrieval

### Performance
- Text analysis API response time (Flask + Groq pipeline)
- Image OCR + classification pipeline response time

---

## Responsibilities

| Role | Assigned | Responsibilities |
|---|---|---|
| CEO / Project Lead | Nuñezca, Christian Dysar | Overall project oversight and quality assurance. Test evaluation report review and sign-off. |
| CFO / COO | Fernandez, Samantha Nicole | Test plan documentation and management. Test results tracking and reporting. Coordinate testing schedule. |
| CTO | Arca, Hans Jio | Test the FastAPI backend and model inference. Test the Groq API image-to-text pipeline. Performance and API response time testing. Defect diagnosis and resolution. |
| CMO | Amba, Clark | Test UI/UX design and layout. Test navigation, responsiveness, and button functionality. Test the results display panel. |

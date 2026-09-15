# AI Interview Coach Pro (GenC-Eval-Trainer)

Real-time Subject-Verb-Object (SVO) analysis, extempore speech coaching, and structured corporate communication assessment powered by Google Gemini 1.5 Flash.

---

## 📌 Overview

**AI Interview Coach Pro** is an automated speech evaluation and communication calibration platform designed specifically for campus graduates, lateral hires, and corporate training programs. By combining real-time browser speech recognition with large language model evaluation, the platform diagnoses syntactic structure, evaluates coherence, detects run-on statements, and delivers actionable feedback in real time.

---

## 🌟 Core Features

- **Multi-Modal Prompt Engine**:
  - **Technical Interview Questions**: Dynamic developer questions across *Easy*, *Medium*, and *Hardcore* tiers.
  - **Extempore Speech Topics**: Generates 1-minute impromptu topics to assess quick thinking and articulation under pressure.
  - **Concept/Vocabulary Drills**: Generates targeted English nouns and abstract concepts for focused fluency drills.
  - Unique seed randomization prevents question repetition during training drills.

- **Real-Time Speech-to-Text Transcription**:
  - Direct microphone integration leveraging the browser's native Web Speech API (`SpeechRecognition`).
  - Real-time interim visual feedback with final sentence aggregation.

- **Automated SVO & Communication Analysis**:
  - **Subject-Verb-Object (SVO) Structure**: Enforces direct, concise professional phrasing and flags fragmented thoughts.
  - **Run-on & Conjunction Detection**: Flags excessive conjunction chaining (e.g., "and then... and so... because...").
  - **Completeness Check**: Penalizes trailing thoughts and unfinished answers.

- **RAG (Red-Amber-Green) Readiness Scoring**:
  - **GREEN**: Production-ready, client-facing communication.
  - **AMBER**: Understandable but requires pacing, conciseness, or grammatical polishing.
  - **RED**: Major syntactic breakdown, run-ons, or incomplete thoughts requiring remediation.
  - Quantitative 0–100 scoring with bulleted analytical feedback.

- **Session Leaderboard**:
  - Tracks top-5 performances locally using session storage to foster healthy competition and self-improvement during practice sessions.

- **Enterprise Reliability & Diagnostics**:
  - Built-in runtime diagnostic banner verifying browser speech capabilities and storage availability.
  - Strict Content-Type inspection preventing cryptic HTML/JSON parsing failures.
  - Secure serverless & local proxying to ensure zero client-side API key exposure.

---

## 💼 Business Perspective: Cognizant & Enterprise Talent Supply Chain

### 1. The Cognizant GenC Context
**GenC (Generation Cognizant)** is Cognizant's flagship entry-level hiring and onboarding engine, recruiting tens of thousands of engineering graduates annually across digital technologies, cloud services, software engineering, and consulting. 

In enterprise IT services, technical acumen alone is insufficient. Client-facing engineers must communicate technical solutions clearly, succinctly, and confidently across global stakeholders.

### 2. The Business Challenge in Campus Recruitment & L&D
- **Interviewer Fatigue & Inconsistency**: Senior engineers and managers dedicate thousands of billable hours conducting preliminary communication rounds, where evaluations are often subjective and inconsistent.
- **The "Bench-to-Billing" Delay**: Fresh graduates with strong coding skills often languish on the unbilled bench for weeks due to failing client communication interviews, increasing overhead costs.
- **High Remediation Costs**: Identifying communication bottlenecks *after* onboarding is expensive. Without objective early diagnostics, Learning & Development (L&D) teams cannot deliver targeted coaching.

### 3. Strategic Value & ROI for Cognizant
| Business Metric | Traditional Model | With GenC-Eval-Trainer |
| :--- | :--- | :--- |
| **Preliminary Screening Cost** | High (senior engineer billable hours) | **Near-Zero** (automated self-service AI evaluation) |
| **Evaluation Objectivity** | Variable (subjective to interviewer bias) | **Standardized** (algorithmic SVO rubrics) |
| **Bench Time Reduction** | Extended communication polishing cycles | **Accelerated** (targeted pre-boarding calibration) |
| **Candidate Throughput** | Limited by interviewer calendar availability | **Unlimited** (concurrent 24/7 self-paced drills) |
| **Feedback Latency** | Days or weeks after panel reviews | **Instantaneous (< 2 seconds)** |

### 4. Enterprise Use Cases
- **Campus Placement Drives (Pre-Hire)**: Automated round-zero filtering to assess candidate spoken English, fluency, and thought structure before allocating technical panels.
- **Cognizant Academy (L&D Onboarding)**: Integrated into foundation training sprints, enabling trainees to complete daily extempore and behavioral modules.
- **Internal Talent Mobility & Client Readiness (Shadow-to-Billable)**: Benchmark engineers rolling off internal projects to ensure immediate client interview readiness.

---

## 🏗️ Architecture

The workspace is engineered with a **dual-environment architecture** to support smooth local iteration as well as serverless production deployment:

```
                          ┌─────────────────────────────┐
                          │   Frontend (Vanilla JS/CSS) │
                          │   index.html, frontend-app  │
                          └──────────────┬──────────────┘
                                         │ POST /api/generate
                     ┌───────────────────┴───────────────────┐
                     │                                       │
                     ▼                                       ▼
        ┌─────────────────────────┐             ┌─────────────────────────┐
        │  V1: Local Calibration  │             │   V2: Cloud Production  │
        │      (server.local.js)  │             │     (api/generate.js)   │
        │   Express.js on :3000   │             │    Vercel Serverless    │
        │   dotenv (.env file)    │             │    Vercel Env Variables │
        └────────────┬────────────┘             └────────────┬────────────┘
                     │                                       │
                     └───────────────────┬───────────────────┘
                                         │ 'x-goog-api-key'
                                         ▼
                      ┌────────────────────────────────────┐
                      │  Google Gemini 1.5 Flash Endpoint  │
                      └────────────────────────────────────┘
```

- **V1: Local Calibration (`server.local.js`)**: An Express.js server running in native ES Module mode (`type: module`). It serves static assets from the root directory, loads `GEMINI_API_KEY` from a local `.env` file via `dotenv`, and proxies requests to Google Gemini via `POST /api/generate`.
- **V2: Production Deployment (`api/generate.js`)**: A Vercel Serverless Function (`export default async function handler(req, res)`) that securely reads `process.env.GEMINI_API_KEY` and forwards requests using the `x-goog-api-key` header, returning clean JSON error responses if upstream Google APIs reject the payload.

---

## 🚀 Local Setup (V1 Calibration)

Follow these steps to run the application locally:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or later recommended).

### 2. Configure Environment Variables
Copy the sample environment template:
```bash
# On Windows (PowerShell / Command Prompt)
copy .env.example .env

# On macOS / Linux
cp .env.example .env
```
Open `.env` and insert your valid Google Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

### 3. Install Dependencies
Install the required local proxy packages (`express` and `dotenv`):
```bash
npm install
```

### 4. Start the Local Server
Run the development server:
```bash
npm run dev
```
You should see:
```
Local calibration server running at http://localhost:3000
```
Open your browser and navigate to **`http://localhost:3000`**.

> [!CAUTION]
> **DO NOT USE VS CODE LIVE SERVER (PORT 5500)!**
> VS Code Live Server only serves static files and does not run the Node.js `/api/generate` backend proxy. Attempting to run the app via Live Server will result in `404 Not Found` HTML responses when fetching prompts, triggering a clear diagnostic error in the application. Always use `npm run dev` on port **3000**.

---

## ☁️ Production Deployment (V2 Vercel)

The repository is preconfigured for zero-config Vercel serverless deployments.

### 1. Push to GitHub / Git Provider
Ensure your code is pushed to your Git repository:
```bash
git add .
git commit -m "Update project documentation and features"
git push origin main
```

### 2. Import into Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Select the `GenC-Eval-Trainer` repository.
3. Framework Preset: Leave as **Other** (Root directory).

### 3. Configure Environment Variables
In the Vercel deployment screen:
1. Navigate to **Environment Variables**.
2. Add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `Your_Gemini_API_Key`
3. Click **Deploy**.

Vercel automatically detects `index.html` as the static entry point and deploys `api/generate.js` as an edge-ready serverless function reachable at `/api/generate`.

---

## 🛡️ Error Handling & Diagnostics

- **Missing or Invalid API Key**: Returns structured HTTP 500 / 401 JSON objects with explanatory messages instead of failing silently.
- **Non-JSON Response Guard**: The frontend checks the `Content-Type` header before parsing API responses. If an HTML error page is returned (e.g. if mistakenly accessed via an unproxied port), a descriptive routing error is rendered directly in the UI.
- **Web Speech API Diagnostic**: The application checks browser capability on load and alerts the user if speech recognition is not supported in the active browser (Chrome and Chromium-based Edge recommended).

---

## 🔮 Future Enhancements

- **Speech Recognition Enhancements**: Add optional audio capture with cloud-based speech-to-text fallback (e.g., Whisper API) for non-Chromium browsers.
- **Advanced Prompt Calibrations**: Include industry-specific question banks (banking/BFSI, healthcare, cloud architecture) aligned with Cognizant business units.
- **Historical Analytics & LMS Integration**: Export candidate scores directly to enterprise LMS platforms (e.g., Degreed, Canvas, Cognizant Academy portals).
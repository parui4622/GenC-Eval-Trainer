# AI Interview Coach Pro

Real-time Subject-Verb-Object (SVO) analysis, extempore speech coaching, and structured corporate communication assessment powered by Google Gemini 1.5 Flash.

---

## 📌 Overview

**AI Interview Coach Pro** is an interactive web application designed to help candidates prepare for corporate interviews and extempore speaking evaluations. It provides:
- **Dynamic Prompt Generation**: Configurable modes for technical interview questions, extempore topics, and vocabulary concept prompts across multiple difficulty levels.
- **Real-Time Speech Transcription**: Captures verbal responses directly via the Web Speech API.
- **Automated SVO & Communication Assessment**: Evaluates sentence structure, detects run-on statements, assesses completeness, and delivers RAG (Red-Amber-Green) status ratings with analytical feedback.
- **Session Leaderboard**: Tracks top candidate scores locally across sessions.

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
git commit -m "Configure dual-environment setup for Vercel and local dev"
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
- **Advanced Prompt Calibrations**: Include industry-specific question banks (finance, system design, HR behavioral) and rubric calibrations for SVO grammatical depth.
- **Historical Analytics**: Persist user evaluation metrics, progress graphs, and audio replay capabilities across practice sessions.
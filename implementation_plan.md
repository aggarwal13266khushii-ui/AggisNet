# Implementation Plan - AI Distress Detector

This plan details the addition of the **AI Distress Detector** feature to the SafeScreen AI codebase. 

## User Review Required

> [!IMPORTANT]
> **Codebase Discrepancy Clarification**:
> The prompt mentions the "GuardRail project using Leaflet.js with an existing Phase 1 SOS button". However, the actual workspace files correspond to the **SafeScreen AI** project, which consists of a Flask backend and a React/HTML dashboard for content moderation. 
> There is **no Leaflet.js map** and **no pre-existing SOS trigger function**.
> 
> **Proposed Solution**:
> 1. We will implement a simulated **SOS trigger function** called `triggerSOSAlert(text)` in the React dashboards. When activated, it will display a persistent, pulsing emergency banner on the screen and log the distress event to the backend log database (making it appear in the dashboard activity log).
> 2. We will implement the new `DiscreetAIAssistant` component in both the React Vite frontend ([App.jsx](file:///c:/Users/dell/OneDrive/Desktop/project/frontend/src/App.jsx)) and the Flask-served HTML dashboard ([index.html](file:///c:/Users/dell/OneDrive/Desktop/project/backend/app/static/index.html)).

### Proposed Heuristic Keyword Lists
We will score input texts based on the following classification categories:
* **RED (Critical Risk / SOS)**: `"help me now"`, `"emergency"`, `"call the police"`, `"danger"`, `"being followed"`, `"kidnap"`, `"kill"`, `"save me"`, `"sos"`, `"assault"`
* **YELLOW (Moderate Risk / Warning)**: `"unsafe"`, `"scared"`, `"suspicious"`, `"creepy"`, `"help"`, `"worry"`, `"afraid"`, `"follow"`, `"hide"`
* **GREEN (Normal / Safe)**: All other texts.

---

## Proposed Changes

### Component Design: `DiscreetAIAssistant`
The component will render:
1. A text input area.
2. A mic button (using `webkitSpeechRecognition`).
3. A visual risk level badge showing the current status (GREEN / YELLOW / RED).
4. A fallback/error warning message below the input if Speech Recognition is unsupported or microphone access is denied.

### Changes to Frontend Files

#### [MODIFY] [App.jsx](file:///c:/Users/dell/OneDrive/Desktop/project/frontend/src/App.jsx)
We will add:
* The heuristic classifier function `classifyText(text)`.
* The simulated SOS trigger function `triggerSOSAlert(text)` which will:
  * Show an emergency alert overlay/banner.
  * Send a POST request to `/api/v1/moderate` to log the SOS distress message in the database.
* The `DiscreetAIAssistant` React component.
* Integration of `DiscreetAIAssistant` into the sidebar (left column, below Sensitivity Settings).

#### [MODIFY] [index.html](file:///c:/Users/dell/OneDrive/Desktop/project/backend/app/static/index.html)
We will mirror the exact same React implementation inside the single-file CDN dashboard to ensure it runs correctly regardless of whether the user accesses the Vite server or the Flask-served port 5000.

---

## Verification Plan

### Automated Tests
* Since this is a frontend-heavy feature using the Web Speech API (which is a browser-only capability), we will verify its functionality manually in the browser.

### Manual Verification
1. Start the Flask backend (`py backend/run.py`).
2. Open the browser at `http://localhost:5000/`.
3. Type normal input (e.g., `"Hello, how are you today?"`) and verify the risk badge remains **GREEN**.
4. Type a warning keyword (e.g., `"I feel unsafe walking home"`) and verify the risk badge turns **YELLOW**.
5. Type or speak an emergency phrase (e.g., `"call the police, help me now"`) and verify the risk badge turns **RED** and triggers the **SOS emergency banner** immediately, as well as posting a logged event to the database.
6. Verify the microphone button works, handles browser support fallbacks gracefully, and shows appropriate error labels if permissions are blocked.
7. Confirm that there are no unhandled JavaScript console errors.

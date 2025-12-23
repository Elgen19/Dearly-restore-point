## Setup & Operation Guide

This document explains how to set up, run, and operate the app in development and production (Vercel + Render/Firebase).

---

## 1. Prerequisites

- **Node.js**: v18+
- **npm**: v9+ (or compatible)
- **Firebase project** with:
  - Realtime Database
  - Authentication (Email/Password + optional Google)
  - Storage (for voice messages and custom uploads)
- **Email provider credentials**:
  - Gmail SMTP or Resend SMTP (configured via environment variables)
- **Hosting**:
  - Frontend: Vercel (recommended) or any static host running `vite build` output.  
  - Backend: Render/Node server (or similar) with Express.

---

## 2. Environment Variables

Both `letter-client` and `letter-server` rely on environment variables. Below is a condensed list of the most important ones.

### 2.1 Server (`letter-server`)

General:
- **`PORT`**: Port to run the Express server on (default: `5000`).  
- **`NODE_ENV`**: `development` or `production`.

Firebase Admin:
- **`FIREBASE_PROJECT_ID`**
- **`FIREBASE_PRIVATE_KEY`** (remember to handle newlines correctly; often needs `replace(/\\n/g, '\n')` in code).  
- **`FIREBASE_CLIENT_EMAIL`**
- **`FIREBASE_DATABASE_URL`**

Email (SMTP) – using either Gmail or Resend:
- **`EMAIL_SERVICE`**: `'gmail' | 'resend' | 'outlook' | 'hotmail'`  
- **`EMAIL_USER`**: SMTP username (for Gmail/Outlook, this is the email address).  
- **`EMAIL_PASS`**: SMTP password or app‑specific password.  
- **`RESEND_API_KEY`**: If using Resend.
- **`EMAIL_SMTP_PORT`**: Optional, defaults based on provider.

Frontend integration:
- **`CLIENT_URL`**: Base URL of the frontend (e.g. `https://your-frontend.vercel.app`).  
  Used to build verification and letter links in emails.

Security & CORS:
- **`ALLOWED_ORIGINS`** (production only): Comma‑separated list of allowed frontend origins:
  - e.g. `https://your-frontend.vercel.app,https://your-alt-domain.com`

### 2.2 Client (`letter-client`)

- **`VITE_BACKEND_URL`**: Base URL of the backend API (e.g. `https://your-backend.onrender.com`).  
- **`VITE_SITE_URL`** (optional): Canonical site URL used in some utilities.

In development, the frontend typically assumes:
- `VITE_BACKEND_URL=http://localhost:5000`

---

## 3. Local Development

### 3.1 Install Dependencies

From the project root:

```bash
cd letter-server
npm install

cd ../letter-client
npm install
```

Ensure `react` and `react-dom` are installed in `letter-client` (already added to `package.json`).

### 3.2 Run Backend (Express)

From `letter-server`:

```bash
npm run dev   # or `node index.js` depending on your scripts
```

Make sure `.env` (or environment) has the server variables described above. The server should start on `http://localhost:5000` by default.

### 3.3 Run Frontend (Vite)

From `letter-client`:

```bash
npm run dev
```

Visit the Vite dev server URL (usually `http://localhost:5173`). Make sure `VITE_BACKEND_URL` points to `http://localhost:5000`.

---

## 4. Build & Deployment

### 4.1 Frontend (Vercel)

**Project root** for Vercel: `letter-client`

**Build command**:
```bash
npm run build
```

**Output directory**:
```text
dist
```

**Environment variables** (Vercel project settings):
- `VITE_BACKEND_URL=https://your-backend.onrender.com`
- Any additional read‑only configuration for the client.

Vercel will:
- Install dependencies (`npm install`).  
- Run `npm run build`.  
- Serve `dist/` as a static site.

### 4.2 Backend (Render or similar)

Deploy `letter-server` as a Node/Express service.

**Start command** (example):
```bash
node index.js
```

**Environment variables**: set all required server variables (Firebase, email, CORS, etc.).

Ensure the public URL (e.g. `https://your-backend.onrender.com`) is used in `VITE_BACKEND_URL` on the frontend.

---

## 5. Operational Flows

### 5.1 Sending a Letter

1. **Sender** signs in (or creates account) via the master UI.  
2. Configures receiver (name + email) via `ReceiverNameSetup`.  
3. Creates a letter in `MasterLetterCraft`:
   - Writes intro, body, and closing.  
   - Optionally configures security (quiz/date).  
   - Optionally attaches games/rewards.
4. Saves the letter → stored in `users/{userId}/letters/{letterId}`.  
5. Generates a secure token → stored in `letterTokens/{token}` and attached to the letter.  
6. Sends an email using either:
   - Immediate send (letter email now), or  
   - Scheduled send (entry in `scheduledEmails/{emailId}` for the scheduler to process).

### 5.2 Receiver Reading a Letter

1. Receiver receives an email with a **tokenized link**: `https://your-frontend/letter/{token}`.  
2. When they open it:
   - `LetterViewer` validates token format on the client.  
   - Backend validates token existence, activity, expiration, and rate limits.  
3. If letter is secured:
   - Receiver answers quiz/date question.  
   - Backend hashes the answer and compares against stored hash.  
4. Upon success:
   - Letter is marked as `read`.  
   - Notification is sent/created for the sender.  
   - `OptionsPage` gives next options (write back, games, PDF, etc.).

### 5.3 Writing a Letter Back (Response)

1. From `OptionsPage`, receiver chooses **“Write a Letter Back”**.  
2. `WritingInterface` opens with romantic prompts and live preview.  
3. On confirm:
   - Response is saved under `users/{senderUserId}/letters/{letterId}/responses/{responseId}`.  
   - Optional notification can be emitted to the sender.
4. Sender can view responses from `MyLetters` or `ViewWriteBackResponses`.

### 5.4 Receiver Accounts & Dashboard

1. Receiver optionally creates an account (Firebase Auth).  
2. Backend links existing letters (by email + token history) to `users/{receiverUserId}/receivedLetters/{letterId}`.  
3. Receiver dashboard lists all received letters and allows re‑access without searching email.

### 5.5 Games & Rewards

1. Sender defines games in `games/{userId}` and attaches them to letters.  
2. Receiver plays games from `OptionsPage` or `LetterViewer` subflows.  
3. Completion + rewards are saved, and rewards are displayed in the **Rewards** modal.

---

## 6. Monitoring & Maintenance

### 6.1 Logs & Audit

- **Server logs** show:
  - Route hits.  
  - Token auto‑renewal and revocation.  
  - Email scheduling and sending events.  
- **Audit logs** (`securityAudit`) capture security‑related incidents (token failures, rate limits, validation errors).

### 6.2 Scheduled Email Job

- The email scheduler periodically checks `scheduledEmails/{emailId}` for ready‑to‑send entries.  
- In traditional hosting (non‑serverless), it’s initialized when the Express app starts.  
- For serverless (e.g. Vercel cron), the handler can be invoked via a scheduled HTTP endpoint (`/api/cron/email-scheduler`). 

### 6.3 Backups & Migration

- All persistent state lives in Firebase Realtime Database and Storage.  
- Use Firebase’s export tools to back up regularly if running in production.

---

## 7. Quick Start Checklist

1. Create Firebase project; enable Auth, Database, Storage.  
2. Configure server `.env` with Firebase + email + CORS variables.  
3. Configure client `.env` with `VITE_BACKEND_URL`.  
4. Run backend (`letter-server`) locally and verify `/api/` health check.  
5. Run frontend (`letter-client`) locally and verify sign‑in + dashboard.  
6. Deploy backend to Render (or similar).  
7. Deploy frontend to Vercel, pointing to backend URL.  
8. Send a test letter to yourself and walk through the full receiver flow.



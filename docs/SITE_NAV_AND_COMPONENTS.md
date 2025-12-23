## Site Navigation & Component Responsibilities

This document explains how users move through the app and what each major React component is responsible for.

---

## 1. Entry & Routing

### `src/main.jsx`
Determines which “mode” of the app to render based on the URL.

- **Routes / URL patterns**
  - `/letter/{token}` → `LetterViewer` (receiver reading a letter via secure token).
  - `/verify-email?...` or `?token=...` → `EmailVerification` (sender/receiver email verification page).
  - `/`, `/dashboard`, `/signin`, `/welcome`, `/setup`, `/craft` (and other authenticated paths) → `MasterApp` (sender experience).
  - Fallback → `App` (legacy/receiver experience, mostly superseded by `LetterViewer` and `LandingPage`).

- **Providers**
  - Wraps UI with:
    - `AuthProvider` – Firebase Auth context.
    - `MusicPlayerProvider` – global background music for receiver flows.
    - `DashboardMusicProvider` – dashboard/letter‑specific background music.

---

## 2. Sender (Master) Experience

### `master/MasterApp.jsx`
Top‑level controller for the sender dashboard and setup flows.

- **Key Views (driven by internal state)**  
  - `SignIn`  
  - `CheckYourEmail` (after signup)  
  - `ForgotPassword`  
  - `WelcomeIntro` (first‑time onboarding)  
  - `ReceiverNameSetup` (configure receiver information)  
  - `Dashboard` (home after setup)  
  - `MasterLetterCraft` (create/edit letters)

- **Responsibilities**
  - Redirects based on authentication state and whether receiver data exists.
  - Handles URL history updates manually (e.g. `/dashboard`, `/setup`, `/craft`).
  - Fetches receiver data (`/api/receiver-data/{userId}`) and auto‑sets it when coming from a receiver account creation flow.

### `master/Dashboard.jsx`
Main sender dashboard.

- **Shows**
  - Overview of letters, responses, games, date planning, and profile controls.
  - Quick access to `MyLetters`, `GameCreationFlow`, and date invitation flows.

- **Key responsibilities**
  - Present sender’s options: create new letter, manage existing letters, open games, review responses.
  - Integrates with background music (`DashboardMusicContext`).

### `master/MasterLetterCraft.jsx`
Full letter‑creation “studio” for senders.

- **Uses components**
  - `IntroductoryPreviewV*`, `MainBodyPreviewV*`, `ClosingPreviewV*` – styled previews.
  - `LetterIntroductory`, `LetterMainBody`, `LetterClosing` – input sections.
  - `SecuritySelector` and related components – configure quiz/date security.
  - `GameSelection` / `GameCreationFlow` – attach/launch games.
  - `LinkGeneratedPage` – show generated token/shareable link.

- **Responsibilities**
  - Manages draft letter content, styling, and security configuration.
  - Saves letters under `users/{userId}/letters/{letterId}`.
  - Triggers token generation via `/api/letters/{userId}/{letterId}/regenerate-token` and email scheduling when needed.

### `master/MyLetters.jsx`
List and manage all letters authored by the sender.

- **Features**
  - Tabs for **Sent Letters** and **Responses**.
  - Shows letter metadata (title, scheduled date, status).
  - Allows editing, deleting, regenerating tokens, and viewing responses.
  - Integrates with animated preview (`ScrollUnravelPreview`) for selected letter.

### `master/ReceiverNameSetup.jsx`
Guided step to configure the primary receiver for a sender.

- **Responsibilities**
  - Collect receiver name and email.
  - Writes `users/{userId}/receiver`.
  - Validates email format and basic name length.

---

## 3. Receiver Experience (Token‑Based)

### `receiver-pages/LetterViewer.jsx`
Core viewer when a receiver opens a link like `/letter/{token}`.

- **Stages**
  - `security` → security gate (quiz/date) if configured.
  - `introductory`, `mainBody`, `closing` → animated letter reveal in stages.
  - `complete` → shows `OptionsPage` to continue journey.

- **Responsibilities**
  - Parse token from URL, validate format, and fetch letter from `/api/letters/token/{token}`.
  - Handle security validation via `/api/letters/{userId}/{letterId}/validate-security`.
  - Manage background music (via `MusicPlayerContext`).
  - Persist viewer state in `sessionStorage` keyed by token.
  - Present romantic loading state that hides backend latency.

### `receiver-pages/OptionsPage.jsx`
Options menu after reading a letter or in receiver dashboard mode.

- **Modes**
  - **Sender mode**: options for the receiver of a specific letter (write back, download PDF, send voice message, play games, view dates).
  - **Receiver dashboard mode** (`isReceiverMode`): show all letters linked to a receiver account via `receiver-accounts` APIs.

- **Key responsibilities**
  - Fetch receiver‑linked letters from `/api/receiver-accounts/letters/{userId}` in receiver mode.
  - Show options grid: **View All Letters**, **Write a Letter Back**, **Download PDF**, **Date Invitation**, **Voice Message**, **Play Games**.
  - Refresh and display available games and obtained rewards.
  - Trigger `WritingInterface` (write back), `ViewAllLetters`, `VoiceMessage`, `DateInvitation`, and `GameSelection` flows via callbacks.

### `receiver-pages/WritingInterface.jsx`
Romantic interface for writing a letter back (receiver → sender).

- **Responsibilities**
  - Provide suggested prompts (grateful, heartfelt, thoughtful responses).
  - Capture and preview the response via `ScrollUnravelPreview`.
  - Save responses under `users/{senderUserId}/letters/{letterId}/responses/{responseId}`.
  - Show confirm/edit overlay and success state.
  - Offer consistent back buttons (mobile + desktop) matching the design language.

### `receiver-pages/ViewWriteBackResponses.jsx`
Displays all responses written by a receiver and allows editing/deleting.

- **Views**
  - List view: “Your Responses” card with compact back button (mobile), header, and “Write a New Response” call‑to‑action.
  - Detail view: selected response with header, timestamps, edit/delete actions, and content/textarea.

- **Responsibilities**
  - Fetch responses for a user (`/api/letters/responses/all/{userId}`).
  - Allow editing responses via `PUT /api/letters/{userId}/{letterId}/responses/{responseId}`.
  - Allow deletion via `DELETE /api/letters/{userId}/{letterId}/responses/{responseId}`.
  - Manage local editing state and modals (delete confirmation, error messages).

### Other Receiver Pages

- **`receiver-pages/ViewAllLetters.jsx`**  
  - Lists all letters accessible to a receiver (token‑based + account‑linked).  
  - Normalizes links and ensures only token‑based links are used.

- **`receiver-pages/VoiceMessage.jsx`**  
  - Record, upload, and play back voice messages tied to a letter.  
  - Uses `/api/voice-upload` and `/api/letters/{userId}/{letterId}/voice-messages` endpoints.

- **`receiver-pages/DateInvitation.jsx`**  
  - Show and manage date invitations associated with letters.  
  - Uses `/api/date-invitations` backend.

- **`receiver-pages/ReceiverDashboard.jsx` / `ReceiverMode.jsx`**  
  - Higher‑level receiver dashboard views that orchestrate `OptionsPage`, letter lists, and navigation between received letters.

---

## 4. Shared Components

### `components/ScrollUnravelPreview.jsx`
Animated scroll/unravel presentation of a letter.

- **Used by**
  - `MasterLetterCraft` (sender preview)
  - `LetterViewer` (receiver stages)
  - `WritingInterface` (response preview)

- **Responsibilities**
  - Animate letter content reveal (intro, body, closing) with scroll‑like animation.
  - Fire callbacks when animation completes (`onOpenComplete`).

### `components/MessageModal.jsx`
Reusable modal for showing info/warning/error/success messages.

- **Used by**
  - `OptionsPage`, `MyLetters`, `WritingInterface`, and others.

### `components/GameSelection.jsx`
Game selection modal/card used in both sender and receiver contexts.

- **Responsibilities**
  - List available games attached to a letter.
  - Let receiver select and start a game (`MemoryMatch`, `LoveQuizPlayer`, `WordScramblePlayer`, etc.).

### `components/NotificationBell.jsx`
Visual notification bell with dropdown listing notifications from `users/{userId}/notifications`.

---

## 5. High-Level Navigation Flows

### Sender Flow
1. Visit app → `MasterApp` → `SignIn` / `WelcomeIntro` / `ReceiverNameSetup`.
2. Land on `Dashboard`.
3. Open `MasterLetterCraft` to create a new letter.
4. Generate link/token and optionally schedule email.
5. Monitor status via `MyLetters` and receive notifications.

### Receiver (Anonymous) Flow
1. Opens `/letter/{token}` from email.  
2. `LetterViewer` loads, optionally shows security gate.  
3. Reads letter through animated stages.  
4. Arrives at `OptionsPage`:
   - Write a letter back (`WritingInterface` → sender responses).  
   - Play games / view rewards.  
   - Download PDF / send voice message / view date invitations.

### Receiver (Account‑Linked) Flow
1. Receiver creates an account and links existing tokens via email.  
2. Dashboard/receiver mode uses `OptionsPage` + `ReceiverDashboard` to show **all received letters**.  
3. Can open any letter, write back, play games, or manage rewards/responses.



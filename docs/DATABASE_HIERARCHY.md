## Database Hierarchy (Firebase Realtime Database & Related Stores)

This document describes the logical data model used by the app. All paths are relative to the Firebase Realtime Database root unless noted otherwise.

---

### 1. `users/{userId}` – User Root

- **`email`**: string  
  Lowercased email address of the user (sender account).
- **`firstName`**: string  
  Sender’s first name.
- **`lastName`**: string  
  Sender’s last name.
- **`emailVerified`**: boolean  
  Whether the email has been verified (via email verification or Google sign‑in).
- **`createdAt`**: ISO string  
  Timestamp when the user record was created.
- **`updatedAt`**: ISO string  
  Timestamp of last profile update.
- **`verifiedAt`**: ISO string | null  
  Timestamp when email was first verified.

#### 1.1 `users/{userId}/receiver`
Receiver profile for the person the sender writes to.

- **`name`**: string  
  Receiver’s display name.
- **`email`**: string  
  Receiver’s email (lowercased, trimmed).
- **`createdAt`**: ISO string  
  When receiver info was created.
- **`updatedAt`**: ISO string  
  When receiver info was last updated.

#### 1.2 `users/{userId}/letters/{letterId}`
Primary storage for each letter authored by a sender.

Core metadata:
- **`introductory`**: string  
  Opening section of the letter.
- **`mainBody`**: string  
  Main content of the letter.
- **`closing`**: string  
  Closing section of the letter.
- **`receiverName`**: string  
  Name of the receiver at the time of writing.
- **`receiverEmail`**: string  
  Receiver’s email for this letter.
- **`status`**: `"draft" | "scheduled" | "sent" | "read"`  
  Overall state of the letter.
- **`createdAt`**: ISO string  
  When the letter was first created.
- **`updatedAt`**: ISO string  
  When the letter was last updated.
- **`readAt`**: ISO string | null  
  When the receiver successfully passed security and read the letter.
- **`accessToken`**: string | null  
  64‑character token used for secure token-based access (`letterTokens/{token}`).
- **`shareableLink`**: string | null  
  Relative link (e.g. `/letter/{token}`) stored for convenience.
- **`dashboardMusic`**: array of objects | []  
  Music tracks associated with this letter’s dashboard view.

Security configuration:
- **`securityType`**: `"none" | "quiz" | "date"`  
  What kind of “unlock” protection is used.
- **`securityConfig`**: object | null  
  - For `quiz`:
    - **`question`**: string – question shown to receiver.  
    - **`correctAnswerHash`**: string – SHA‑256 hash of normalized correct answer.  
  - For `date`:
    - **`prompt`**: string – description of the date question.  
    - **`correctDateHash`**: string – SHA‑256 hash of normalized date string.  
  - May contain extra helper fields, but hashes are the only values used in backend validation.

Scheduling (if used):
- **`scheduledDateTime`**: ISO string | null  
  When the letter is scheduled to be emailed.
- **`scheduledStatus`**: `"pending" | "sending" | "sent" | "cancelled"`  
  State of scheduled email, if any.

Games / rewards metadata (per letter):
- **`games`**: object | null  
  Per‑letter game config, typically pointing into `games/{userId}` for full details.
- **`hasGames`**: boolean | null  
  Helper flag to show games in the UI.

Other display / template fields (not exhaustive):
- **`templateId`**: string | null  
  Which visual letter template is used in the PDF/preview.
- **`animationStyle` / `introStyle` / `mainBodyStyle` / `closingStyle`**: object | null  
  UI‑specific style configurations used by the viewer and PDF generator.

#### 1.3 `users/{userId}/letters/{letterId}/responses/{responseId}`
Responses written **back** by the receiver.

- **`content`**: string  
  Body of the receiver’s response.
- **`createdAt`**: ISO string  
  When the response was written.
- **`updatedAt`**: ISO string  
  When the response was last edited.
- **`receiverEmail`**: string | null  
  Email of the receiver who wrote this response (if known).
- **`status`**: string | null  
  Reserved for potential moderation / read flags.

#### 1.4 `users/{userId}/notifications/{notificationId}`
In‑app notifications for the sender.

- **`type`**: string  
  e.g. `"letter_read"`, `"letter_pdf_download"`, `"letter_security_access"`.
- **`letterId`**: string | null  
  Related letter ID, if applicable.
- **`letterTitle`**: string | null  
  Short title or introductory snippet of the letter.
- **`message`**: string  
  Human‑readable notification text (often romantic/soft tone).
- **`read`**: boolean  
  Whether the sender has viewed this notification.
- **`createdAt`**: ISO string  
  When the notification was created.

#### 1.5 `users/{userId}/receivedLetters/{letterId}`
Letters linked to a **receiver account** (when receivers sign up).

- **`senderUserId`**: string  
  UID of the sender who created the letter.
- **`senderName`**: string  
  Sender’s display name at linking time.
- **`letterTitle`**: string  
  Human‑friendly title/intro snippet.
- **`accessedAt`**: ISO string  
  When the receiver first accessed this letter via token or account.
- **`readAt`**: ISO string | null  
  When the receiver finished reading.
- **`status`**: `"unread" | "read"`  
  Receiver’s local status for this letter.
- **`linkedVia`**: `"token" | "email" | "direct"`  
  How the account was linked.
- **`originalToken`**: string | null  
  Access token used when the letter was first accessed.

---

### 2. `letterTokens/{token}` – Shareable Letter Access Tokens

Each token is a 64‑character hex string generated by `crypto.randomBytes(32)`.

- **`userId`**: string  
  Sender’s UID that owns the letter.
- **`letterId`**: string  
  ID of the associated letter under `users/{userId}/letters/{letterId}`.
- **`receiverEmail`**: string | null  
  Target receiver’s email (used for linking accounts).
- **`createdAt`**: ISO string  
  When the token was created.
- **`expiresAt`**: ISO string  
  When the link should expire (initially ~1 year, auto‑renewed in some cases).
- **`isActive`**: boolean  
  If false, the token is revoked and cannot be used.
- **`renewalCount`**: number  
  How many times auto‑renewal has extended the expiration.
- **`lastRenewedAt`**: ISO string | null  
  When it was last auto‑renewed.
- **`firstAccessedAt`**: ISO string | null  
  When the token was first used.
- **`lastAccessedAt`**: ISO string | null  
  When the token was most recently used.
- **`accessCount`**: number | null  
  How many times the token was used to fetch the letter.
- **`linkedToAccount`**: string | null  
  Receiver’s userId if the token has been linked to a receiver account.

#### 2.1 `letterTokens/{token}/accessLog/{accessLogId}`

- **`accessedAt`**: ISO string  
  When this access occurred.
- **`ip`**: string  
  Anonymized IP (e.g. `192.168.xxx.xxx`), used for analytics and security.

---

### 3. `emailVerificationTokens/{token}`

Tokens for verifying sender/receiver email addresses.

- **`email`**: string  
  Email address being verified.
- **`firstName`**: string  
  First name for greetings.
- **`lastName`**: string  
  Last name for greetings.
- **`userId`**: string  
  UID of the associated Firebase Auth user.
- **`createdAt`**: number (ms since epoch)  
  When the token was created.
- **`expiresAt`**: number (ms since epoch)  
  When it will expire (typically 24 hours).
- **`used`**: boolean  
  Whether the token has already been used.
- **`usedAt`**: number | null  
  When it was used, if applicable.

#### 3.1 `emailVerificationUserIdMap/{userId}`

- **`token`**: string  
  Last verification token issued for this user.
- **`createdAt`**: number  
  Timestamp (ms) when mapping was created.

---

### 4. `scheduledEmails/{emailId}`

Used by the email scheduler job to store outgoing emails.

- **`recipientEmail`**: string  
  Email address of receiver.
- **`letterId`**: string  
  Associated letter ID.
- **`userId`**: string  
  Sender UID that owns the letter.
- **`scheduledDateTime`**: ISO string  
  When the email is intended to be sent.
- **`status`**: `"pending" | "sending" | "sent" | "failed"`  
  Current status of the scheduled email.
- **`createdAt`**: ISO string  
  When the schedule entry was created.
- **`updatedAt`**: ISO string  
  Last time status was updated.
- **`sendingStartedAt`**: ISO string | null  
  When the scheduler picked it up to send.
- **`mailOptions`**: object  
  Transport‑ready payload used by the email sending helper (subject, html, etc.).

---

### 5. `games/{userId}/{gameId}`

Game definitions created by the sender.

- **`type`**: `"memory-match" | "quiz" | "word-scramble" | ...`  
  Game type identifier.
- **`title`**: string  
  Display title of the game.
- **`description`**: string  
  Short description shown to receiver.
- **`rewards`**: array of reward objects  
  Each reward object includes:
  - **`id`**: string – reward ID/key.  
  - **`name`**: string – reward name.  
  - **`description`**: string – what the reward is.  
  - **`type`**: string – category (e.g. `food-drink`, `date-outing`, `emotional-digital`).  
  - **`content`**: string – optional extended message/instructions.
- **`createdAt`**: ISO string  
  When the game was created.
- **`updatedAt`**: ISO string  
  When the game was last updated.

Completion/receiver‑side fields (per receiver interaction – often denormalized back into letters and responses):
- **`isCompleted`**: boolean  
  Whether the receiver completed this game.
- **`completedAt`**: ISO string | null  
  When game was completed.
- **`claimedRewardId`**: string | null  
  ID/index of the reward the receiver obtained.
- **`rewardFulfilled`**: boolean | null  
  Whether the sender has fulfilled the promised reward.

---

### 6. `quizzes/{userId}/{quizId}`

Standalone quizzes that can be attached to letters.

- **`title`**: string  
  Quiz name.
- **`questions`**: array  
  Each question generally has:
  - **`question`**: string  
  - **`options`**: string[]  
  - **`correctIndex`**: number  
- **`createdAt` / `updatedAt`**: ISO strings  
  Standard audit timestamps.

---

### 7. `receiverAccounts` (via `receiver-accounts` API)

The `receiver-accounts` API relies primarily on:

- `users/{receiverUserId}/receivedLetters/{letterId}` (described above)
- `letterTokens/{token}` fields `linkedToAccount`, `linkedAt`

Fields on the token when linking:
- **`linkedToAccount`**: string  
  Receiver’s userId.
- **`linkedAt`**: ISO string  
  When the link was established.

---

### 8. `securityAudit/{auditId}`

Write‑only audit trail for important security‑related events (not read by the client).

Common fields (some may be omitted per event type):
- **`eventType`**: string  
  e.g. `"token_access"`, `"security_validation"`, `"rate_limit_violation"`, `"auth_event"`.
- **`timestamp`**: ISO string  
  When this event was recorded.
- **`ip`**: string  
  Anonymized IP associated with the request.
- **`userAgent`**: string | null  
  HTTP user‑agent string.
- **`path`**: string | null  
  API path associated with the event.
- **`token`**: string | null  
  Truncated token (first 8 chars + `...`) for reference.
- **`letterId`**: string | null  
  Related letter, if applicable.
- **`success`**: boolean | null  
  Whether the action succeeded or failed.
- **`reason`**: string | null  
  Short code/description for failures (e.g. `"token_not_found"`, `"token_expired"`, `"incorrect_answer"`).

---

This hierarchy covers the primary data structures used by the app. Additional internal or UI‑only fields may exist, but the lists above represent the stable, security‑ and feature‑relevant schema.



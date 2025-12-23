## Security Model

This document summarizes the security controls implemented across the app: authentication, authorization, token handling, rate limiting, logging, and data protection.

---

## 1. Authentication & Authorization

### 1.1 Firebase Auth (Senders & Receivers)

- **Backend middleware**: `middleware/auth.js`
  - `verifyAuth`  
    - Extracts `Authorization: Bearer <idToken>` header.  
    - Verifies Firebase ID token using Admin SDK.  
    - On success, sets `req.user = { uid, email, emailVerified }`.  
    - On failure, returns `401` with generic error messages (no internal details).

  - `verifyOwnership`  
    - Requires `req.user` from `verifyAuth`.  
    - Compares `req.params.userId` with `req.user.uid`.  
    - If mismatch, returns `403 Unauthorized: You can only access your own resources`.

- **Usage**
  - Protects sender operations such as:
    - Creating/updating/deleting letters.  
    - Regenerating letter tokens.  
    - Managing games and rewards.  
    - Accessing user-specific data (responses, notifications).

---

## 2. Token Security

### 2.1 Access Tokens for Letters (`letterTokens/{token}`)

- **Token generation**
  - Uses `crypto.randomBytes(32).toString('hex')` → 64‑character hex token (256 bits of entropy).
  - Tokens are stored in Firebase at `letterTokens/{token}` with references to `userId` and `letterId`.

- **Validation rules** (server)
  - Path: `GET /api/letters/token/:token`
  - Checks:
    - Token exists in `letterTokens/{token}`.  
    - `isActive !== false` (revoked tokens are considered invalid).  
    - `expiresAt` is in the future.  
    - Token format: must match `/^[a-f0-9]{64}$/i` (also validated on the client).

- **Expiration & Auto‑Renewal**
  - Initial `expiresAt` = 1 year from creation.
  - On each successful access:
    - If token will expire in ≤ 30 days and `renewalCount < 10`, auto‑extends by 1 year.  
    - Updates `renewalCount`, `lastRenewedAt`.
  - Limits auto‑renewal to 10 times (max ~10 years lifetime).

- **Revocation**
  - Regenerating a token for a letter:
    - Marks old token’s `isActive` = `false`.  
    - Creates a new token + updates `accessToken` on the letter.

- **Usage Tracking**
  - Each token stores `firstAccessedAt`, `lastAccessedAt`, and `accessCount`.  
  - `letterTokens/{token}/accessLog/{accessLogId}` records anonymized IP + timestamps.

### 2.2 Email Verification Tokens (`emailVerificationTokens/{token}`)

- **Storage**
  - All verification tokens persist under `emailVerificationTokens/{token}` instead of in memory.
  - Mappings from `userId` to last token stored in `emailVerificationUserIdMap/{userId}`.

- **Validation rules**
  - Links expire after 24 hours (`expiresAt` as ms timestamp).  
  - Token is marked `used = true` upon successful verification.  
  - Expired tokens are cleaned up periodically by a background job.

- **Error messaging**
  - Romantic, non‑technical messages for invalid/expired tokens: e.g. *“This verification link has expired. Please request a new verification email.”*

---

## 3. Rate Limiting

### 3.1 Token Access

- **`tokenAccessLimiter`** in `api/letters.js`
  - Window: 15 minutes.  
  - Max: 50 requests per IP.  
  - Protects `/api/letters/token/:token` from brute‑force guessing.

### 3.2 Token Regeneration

- **`tokenRegenerationLimiter`** in `api/letters.js`
  - Window: 1 hour.  
  - Max: 5 regenerations per IP.  
  - Prevents abuse of token regeneration endpoint.

### 3.3 Security Answer Validation

- **`securityAnswerLimiter`** in `api/letters.js`
  - Window: 15 minutes.  
  - Max: 5 failed attempts per IP.  
  - Romantic error message when limit is reached (encouraging patience rather than exposing technical details).
  - Uses a custom `handler` to return structured JSON and log a rate‑limit violation (see audit logging).

---

## 4. Input Validation & Sanitization

Implemented via `middleware/validation.js` and localized checks.

### 4.1 Request Body Sanitization

- `sanitizeBody` runs on selected endpoints (e.g. letter creation/update, security validation):
  - Trims all string fields.  
  - Strips control characters (except newline/tab in text areas).  
  - Caps length:
    - Long‑form fields (`introductory`, `mainBody`, `closing`, `content`) → up to 50,000 chars.  
    - Other fields → up to 1,000 chars.

### 4.2 Parameter Validation

- `validateTokenParam`  
  - Ensures `:token` param present and matches 64‑character hex pattern.  
  - Returns soft, romantic error for invalid links.

- `validateUserIdParam`  
  - Ensures `:userId` param present and matches acceptable UID pattern (`[a-zA-Z0-9_-]{15,128}`).

- `validateLetterIdParam`  
  - Ensures `:letterId` param present and is a reasonable ID (`[a-zA-Z0-9_-]{1,128}`).

### 4.3 Email Validation

- Backend and frontend both validate email using a simple RFC‑like regex.  
- All stored emails are lowercased and trimmed to avoid duplicates and mismatches.

---

## 5. Logging & Privacy

### 5.1 IP Anonymization

- Implemented via `anonymizeIP` in `middleware/validation.js`:
  - IPv4: keeps first 2 octets, masks the rest (e.g. `192.168.xxx.xxx`).  
  - IPv6: keeps first 4 groups, masks the rest.  
  - Used when storing `ip` in `letterTokens/{token}/accessLog` and security audit logs.

### 5.2 Audit Logging (`middleware/audit.js`)

- `logSecurityEvent` writes to `securityAudit/{auditId}`.

- Helper wrappers:
  - `logAuthEvent(req, eventType, details)` – auth‑related events.
  - `logTokenAccess(req, token, success, reason)` – token usage, including failure reasons like `token_not_found`, `token_expired`.
  - `logSecurityValidation(req, letterId, success, reason)` – results of security answer checks.
  - `logRateLimitViolation(req, endpoint)` – records when a rate limit handler is triggered.

- **Goals**
  - Create a privacy‑respecting forensic trail for suspicious activity.  
  - Avoid personally identifiable details in logs beyond anonymized IP and truncated tokens.

### 5.3 Production vs Development Logging

- Many detailed logs (full request bodies, full letter objects) are **restricted to development** ONLY.  
- In production:
  - Full content is not logged; only metadata is logged.  
  - Responses that might reveal security state (e.g. `isCorrect`) are redacted in logs.

---

## 6. Transport & HTTP Security

### 6.1 Helmet Configuration (`index.js`)

- Uses `helmet()` with:
  - **`contentSecurityPolicy`**: enabled in production, disabled in dev for convenience.  
  - **`hsts`**: forces HTTPS (1 year, includes subdomains, preload).  
  - **`frameguard: 'deny'`**: prevents clickjacking.  
  - **`noSniff`**: disables MIME type sniffing.  
  - **`xssFilter`**: enables basic XSS protections in older browsers.  
  - **`referrerPolicy: 'strict-origin-when-cross-origin'`**: limits referrer leakage.

### 6.2 CORS Configuration

- `cors` configured with `allowedOrigins`:
  - In production: **must** be provided via `ALLOWED_ORIGINS` env var; process exits if missing.  
  - In development: allows all origins **plus** always allows `localhost`/`127.0.0.1` for ease of testing.

- Preflight handler (`OPTIONS`):
  - Allows localhost origins.  
  - For other origins, checks against allowed list or dev mode.

---

## 7. Data Protection & Privacy

### 7.1 Letters & Responses

- Stored under `users/{userId}/letters/{letterId}` and `.../responses/{responseId}`.  
- Never exposed to other users except via:
  - A valid, active token for that specific letter.  
  - A receiver account explicitly linked to that letter.

### 7.2 Receiver Accounts & Linking

- `receiver-accounts` API:
  - Ensures that receiver email matches the `receiverEmail` on letters before linking.  
  - Links are stored under `users/{receiverUserId}/receivedLetters/{letterId}`.  
  - Optionally updates `letterTokens/{token}.linkedToAccount` for future auditing.

### 7.3 Security Answer Storage

- Correct answers for security gates are **never stored in plaintext**:
  - Only normalized SHA‑256 hashes are kept (`correctAnswerHash`, `correctDateHash`).  
  - Incoming answers are normalized and hashed, then compared server‑side.

---

## 8. UX‑Friendly Security Messaging

While the backend is strict, error messages are intentionally non‑technical and romantic:

- Rate limits → gentle “take a breath” guidance instead of “429” jargon.
- Invalid/expired tokens → “link has reached the end of its journey” rather than raw error codes.
- Security answer failures → encouragement to try again with care, rather than harsh rejection.

This preserves the emotional tone of the app while keeping strong security semantics behind the scenes.



# 🔐 Security Analysis: Letter URL Structure

## Current URL Structure
```
/letter/{userId}/{letterId}?preview=true
Example: /letter/5eoj58KAOgT9CpyPND05EGO3lKn2/-Oel6wTPeyVgeuwlbUtB?preview=true
```

## ⚠️ Security Concerns Identified

### 1. **No Authorization Check on Backend API**
**Risk Level: HIGH**

The GET endpoint `/api/letters/:userId/:letterId` (line 77-113 in `letter-server/api/letters.js`) does **NOT** verify that the requester has permission to view the letter. It simply:
- Checks if the letter exists
- Returns the letter data if found

**Attack Vector:**
```javascript
// Anyone can access any letter by guessing/brute-forcing IDs
GET /api/letters/{anyUserId}/{anyLetterId}
```

### 2. **User ID and Letter ID Exposure**
**Risk Level: MEDIUM**

**Issues:**
- **User IDs** (Firebase UIDs) are exposed in URLs
  - While not secret, they enable enumeration attacks
  - Can be used to correlate user activity
  - Makes it easier to discover other letters from the same user

- **Letter IDs** (Firebase push IDs) are exposed
  - Can be guessed/enumerated (Firebase push IDs are somewhat predictable)
  - No authentication required to access

**Attack Scenario:**
1. Attacker discovers a valid `userId` from a shared link
2. Attacker tries common letter IDs or enumerates them
3. Attacker can access all letters from that user

### 3. **Client-Side Security Only**
**Risk Level: HIGH**

The security features (quiz/date locks) are enforced **only on the client side**:
- Security checks happen in `LetterViewer.jsx` (frontend)
- Backend API returns full letter data regardless of security settings
- Attacker can bypass security by calling the API directly

**Bypass Method:**
```javascript
// Direct API call bypasses all client-side security
fetch('/api/letters/{userId}/{letterId}')
  .then(res => res.json())
  .then(letter => console.log(letter.mainBody)); // Full content exposed!
```

### 4. **No Rate Limiting**
**Risk Level: MEDIUM**

- No protection against enumeration attacks
- Attacker can rapidly try many user/letter ID combinations
- No IP-based throttling

### 5. **Preview Mode Not Enforced**
**Risk Level: LOW**

The `?preview=true` parameter is only checked client-side:
- No backend validation
- Doesn't affect API access
- Could be used to bypass certain client-side restrictions

---

## 🛡️ Recommended Security Solutions

### Solution 1: **Token-Based Access (RECOMMENDED)**

Replace direct IDs with secure, time-limited tokens:

**Implementation:**
1. Generate a unique token when creating a shareable link
2. Store token → letter mapping in database
3. Use token in URL instead of IDs

**URL Structure:**
```
/letter/{token}
Example: /letter/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Backend Changes:**
```javascript
// Store token when creating letter
const token = crypto.randomBytes(32).toString('hex');
await db.ref(`letterTokens/${token}`).set({
  userId: userId,
  letterId: letterId,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
});

// GET endpoint with token
router.get("/:token", checkFirebase, async (req, res) => {
  const tokenRef = db.ref(`letterTokens/${req.params.token}`);
  const tokenData = await tokenRef.once("value");
  
  if (!tokenData.exists()) {
    return res.status(404).json({ message: "Invalid link" });
  }
  
  const { userId, letterId, expiresAt } = tokenData.val();
  
  // Check expiration
  if (new Date(expiresAt) < new Date()) {
    return res.status(410).json({ message: "Link has expired" });
  }
  
  // Fetch letter
  const letterRef = db.ref(`users/${userId}/letters/${letterId}`);
  const letter = await letterRef.once("value");
  
  res.json({ id: letterId, ...letter.val() });
});
```

**Benefits:**
- ✅ No user/letter IDs exposed
- ✅ Tokens can expire
- ✅ Tokens can be revoked
- ✅ Harder to enumerate (random tokens)
- ✅ Can track access (who viewed when)

### Solution 2: **Signed URLs (Alternative)**

Use cryptographically signed URLs that can be verified:

**Implementation:**
```javascript
const crypto = require('crypto');

// Generate signed URL
const secret = process.env.LETTER_SECRET_KEY;
const data = `${userId}:${letterId}:${Date.now()}`;
const signature = crypto.createHmac('sha256', secret)
  .update(data)
  .digest('hex');
const token = Buffer.from(`${data}:${signature}`).toString('base64url');

// URL: /letter/{token}
// Verify on backend
const [dataPart, signature] = Buffer.from(token, 'base64url')
  .toString()
  .split(':');
const expectedSig = crypto.createHmac('sha256', secret)
  .update(dataPart)
  .digest('hex');
if (expectedSig !== signature) {
  return res.status(403).json({ message: "Invalid signature" });
}
```

### Solution 3: **Add Authorization Checks (Minimum)**

If keeping current structure, add authorization:

**Backend Changes:**
```javascript
router.get("/:userId/:letterId", checkFirebase, async (req, res) => {
  try {
    const { userId, letterId } = req.params;
    
    // OPTION A: Check if letter is marked as "public" or has shareableLink
    const letterRef = db.ref(`users/${userId}/letters/${letterId}`);
    const snapshot = await letterRef.once("value");
    const letter = snapshot.val();
    
    if (!letter) {
      return res.status(404).json({ message: "Letter not found" });
    }
    
    // Only allow access if letter has shareableLink (intended to be shared)
    if (!letter.shareableLink) {
      return res.status(403).json({ message: "Letter is not shareable" });
    }
    
    // OPTION B: Check access token in query/header
    const accessToken = req.query.token || req.headers['x-letter-token'];
    if (letter.accessToken && letter.accessToken !== accessToken) {
      return res.status(403).json({ message: "Invalid access token" });
    }
    
    res.status(200).json({ id: letterId, ...letter });
  } catch (error) {
    // ...
  }
});
```

### Solution 4: **Rate Limiting**

Add rate limiting to prevent enumeration:

```javascript
const rateLimit = require('express-rate-limit');

const letterAccessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many requests, please try again later.'
});

router.get("/:userId/:letterId", letterAccessLimiter, checkFirebase, async (req, res) => {
  // ...
});
```

### Solution 5: **Enforce Security on Backend**

Move security checks to backend:

```javascript
router.get("/:userId/:letterId", checkFirebase, async (req, res) => {
  // ... fetch letter ...
  
  // Check security if required
  if (letter.securityType && letter.securityConfig) {
    // Require security verification before returning content
    const securityVerified = req.query.securityVerified === 'true';
    const securityAnswer = req.query.securityAnswer;
    
    if (!securityVerified) {
      // Return letter metadata only, not content
      return res.json({
        id: letterId,
        securityType: letter.securityType,
        securityConfig: {
          question: letter.securityConfig.question,
          questionType: letter.securityConfig.questionType,
          options: letter.securityConfig.options
        },
        // Don't return mainBody, closing, etc.
      });
    }
    
    // Verify answer on backend
    if (letter.securityType === 'quiz') {
      const answerHash = hashAnswer(securityAnswer);
      if (answerHash !== letter.securityConfig.correctAnswerHash) {
        return res.status(403).json({ message: "Incorrect answer" });
      }
    }
  }
  
  // Return full letter only if security passed
  res.json({ id: letterId, ...letter });
});
```

---

## 📋 Implementation Priority

### **Immediate (Before Production):**
1. ✅ Add authorization check to GET endpoint
2. ✅ Implement rate limiting
3. ✅ Move security verification to backend

### **Short Term:**
4. ✅ Implement token-based access
5. ✅ Add token expiration
6. ✅ Add access logging

### **Long Term:**
7. ✅ Consider signed URLs for extra security
8. ✅ Add analytics for link usage
9. ✅ Implement link revocation

---

## 🔒 Current Mitigations

**What's Already Working:**
- ✅ Firebase Security Rules protect direct database access (if configured)
- ✅ Backend uses Admin SDK (bypasses rules, but controlled)
- ✅ Client-side security features (quiz/date locks) provide UX protection
- ✅ Preview mode flag exists (though not enforced)

**What Needs Fixing:**
- ❌ No backend authorization
- ❌ IDs exposed in URLs
- ❌ Security checks only client-side
- ❌ No rate limiting
- ❌ No token expiration

---

## 🎯 Recommended Approach

**For Production Deployment:**

1. **Implement Token-Based Access (Solution 1)**
   - Most secure
   - Best user experience
   - Prevents enumeration
   - Allows expiration/revocation

2. **Add Rate Limiting (Solution 4)**
   - Prevents brute force
   - Protects against DoS

3. **Enforce Security on Backend (Solution 5)**
   - Prevents API bypass
   - Ensures security checks can't be skipped

4. **Keep Current Structure as Fallback**
   - For preview mode (authenticated users)
   - For internal testing

---

## 📝 Example Secure Implementation

See `SECURE_LETTER_ACCESS.md` for a complete implementation guide.


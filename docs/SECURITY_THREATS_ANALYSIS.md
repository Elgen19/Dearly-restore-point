# 🔐 Security Threats Analysis - Token-Based System

## ⚠️ Critical Security Issues Identified

### 1. **No Authorization Check on Token Regeneration** 🔴 CRITICAL

**Issue:** The `POST /api/letters/:userId/:letterId/regenerate-token` endpoint does NOT verify that the requester owns the letter.

**Current Code:**
```javascript
router.post("/:userId/:letterId/regenerate-token", checkFirebase, async (req, res) => {
  const { userId, letterId } = req.params;
  // ❌ NO CHECK: Does req.user match userId?
  // ❌ NO CHECK: Is user authenticated?
  // ❌ NO CHECK: Does user own this letter?
```

**Attack Vector:**
```javascript
// Attacker can regenerate tokens for ANY letter if they know userId/letterId
POST /api/letters/{victimUserId}/{victimLetterId}/regenerate-token
// This would:
// 1. Deactivate victim's token
// 2. Create new token attacker controls
// 3. Victim loses access to their own letter
```

**Risk Level:** 🔴 **CRITICAL** - Allows unauthorized token regeneration

**Impact:**
- Attacker can revoke victim's access to their letters
- Attacker can take control of letter tokens
- Denial of service (DoS) - attacker can repeatedly regenerate tokens

---

### 2. **Auto-Renewal Abuse** 🟡 MEDIUM

**Issue:** Auto-renewal can be exploited to keep tokens alive indefinitely.

**Current Behavior:**
- Token auto-renews if accessed within 30 days of expiration
- No limit on renewal frequency
- No check for automated access

**Attack Vector:**
```javascript
// Attacker sets up automated script
setInterval(() => {
  fetch('/api/letters/token/{token}');
}, 86400000); // Every 24 hours

// Result: Token never expires, stays active forever
```

**Risk Level:** 🟡 **MEDIUM** - Allows indefinite token extension

**Impact:**
- Tokens intended to expire can be kept alive forever
- Defeats the purpose of expiration
- Could lead to unauthorized long-term access

---

### 3. **No Rate Limiting** 🟡 MEDIUM

**Issue:** No rate limiting on token access or regeneration endpoints.

**Current Behavior:**
- Unlimited requests to token endpoints
- No protection against brute force
- No protection against DoS attacks

**Attack Vectors:**

1. **Brute Force Token Guessing:**
   ```javascript
   // Attacker tries random tokens (unlikely but possible with enough attempts)
   for (let i = 0; i < 1000000; i++) {
     const randomToken = generateRandomToken();
     fetch(`/api/letters/token/${randomToken}`);
   }
   ```

2. **DoS via Auto-Renewal:**
   ```javascript
   // Attacker repeatedly accesses token to trigger auto-renewal
   // Causes database writes on every request
   ```

3. **Token Regeneration Spam:**
   ```javascript
   // Attacker repeatedly regenerates tokens
   // Causes database writes and deactivates tokens
   ```

**Risk Level:** 🟡 **MEDIUM** - Could lead to DoS or resource exhaustion

---

### 4. **IP Address Logging Privacy** 🟢 LOW

**Issue:** IP addresses are logged without user consent or privacy policy.

**Current Code:**
```javascript
await accessLogRef.set({
  accessedAt: new Date().toISOString(),
  ip: req.ip || req.connection.remoteAddress // ⚠️ Privacy concern
});
```

**Risk Level:** 🟢 **LOW** - Privacy/Compliance concern

**Impact:**
- GDPR/Privacy compliance issues
- User location tracking
- Potential data breach if logs are compromised

---

### 5. **Unlimited Access Logging** 🟢 LOW

**Issue:** Access logs grow indefinitely without cleanup.

**Current Behavior:**
- Every token access creates a log entry
- No log rotation or cleanup
- Database size grows unbounded

**Risk Level:** 🟢 **LOW** - Resource/storage concern

**Impact:**
- Database storage costs increase
- Performance degradation over time
- Potential database bloat

---

## 🛡️ Recommended Security Fixes

### Fix 1: Add Authorization to Token Regeneration (CRITICAL)

**Implementation:**
```javascript
router.post("/:userId/:letterId/regenerate-token", checkFirebase, async (req, res) => {
  try {
    const { userId, letterId } = req.params;
    
    // ✅ ADD: Verify user is authenticated
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // ✅ ADD: Verify user owns the letter
    if (req.user.uid !== userId) {
      return res.status(403).json({ message: "Unauthorized: You can only regenerate tokens for your own letters" });
    }
    
    // ... rest of code
  }
});
```

**Required:** Add authentication middleware to verify `req.user`

---

### Fix 2: Limit Auto-Renewal Frequency

**Implementation:**
```javascript
// Add maxRenewals field to token
const tokenData = tokenSnapshot.val();

// Check if token has been renewed too many times
const maxRenewals = 10; // Limit to 10 renewals (10 years total)
if (tokenData.renewalCount >= maxRenewals) {
  // Don't auto-renew, token has reached max lifetime
  console.log(`Token ${token.substring(0, 8)}... has reached max renewals`);
} else if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
  const newExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  await tokenRef.update({ 
    expiresAt: newExpiresAt,
    renewalCount: (tokenData.renewalCount || 0) + 1,
    lastRenewedAt: new Date().toISOString()
  });
}
```

**Alternative:** Add cooldown period (e.g., can only renew once per month)

---

### Fix 3: Add Rate Limiting

**Implementation:**
```javascript
const rateLimit = require('express-rate-limit');

// Rate limit for token access
const tokenAccessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for token regeneration
const tokenRegenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 regenerations per hour
  message: 'Too many token regenerations. Please try again later.',
});

router.get("/token/:token", tokenAccessLimiter, checkFirebase, async (req, res) => {
  // ...
});

router.post("/:userId/:letterId/regenerate-token", tokenRegenerationLimiter, checkFirebase, async (req, res) => {
  // ...
});
```

---

### Fix 4: Add Authentication Middleware

**Create:** `letter-server/middleware/auth.js`

```javascript
const admin = require('firebase-admin');

const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { verifyAuth };
```

**Usage:**
```javascript
const { verifyAuth } = require('../middleware/auth');

router.post("/:userId/:letterId/regenerate-token", 
  verifyAuth, // ✅ Add authentication
  checkFirebase, 
  async (req, res) => {
    // Now req.user.uid is available
  }
);
```

---

### Fix 5: Privacy-Compliant Logging

**Implementation:**
```javascript
// Option A: Hash IP addresses
const crypto = require('crypto');
const hashedIP = crypto.createHash('sha256')
  .update(req.ip || 'unknown')
  .digest('hex')
  .substring(0, 16); // Truncate for privacy

await accessLogRef.set({
  accessedAt: new Date().toISOString(),
  ipHash: hashedIP // ✅ Hashed instead of plain IP
});

// Option B: Remove IP logging entirely
await accessLogRef.set({
  accessedAt: new Date().toISOString()
  // ✅ No IP address logged
});

// Option C: Add log retention policy
// Delete logs older than 90 days
```

---

### Fix 6: Add Log Cleanup Job

**Implementation:**
```javascript
// Scheduled job to clean old access logs
const cleanupAccessLogs = async () => {
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days
  
  // Query all tokens with access logs
  const tokensRef = db.ref('letterTokens');
  const snapshot = await tokensRef.once('value');
  const tokens = snapshot.val();
  
  for (const [token, tokenData] of Object.entries(tokens)) {
    if (tokenData.accessLog) {
      const logs = tokenData.accessLog;
      for (const [logId, log] of Object.entries(logs)) {
        if (new Date(log.accessedAt) < cutoffDate) {
          await db.ref(`letterTokens/${token}/accessLog/${logId}`).remove();
        }
      }
    }
  }
};

// Run daily
setInterval(cleanupAccessLogs, 24 * 60 * 60 * 1000);
```

---

## 📊 Risk Summary

| Issue | Risk Level | Priority | Impact |
|-------|-----------|----------|--------|
| No Authorization on Regenerate | 🔴 CRITICAL | P0 | Unauthorized token control |
| Auto-Renewal Abuse | 🟡 MEDIUM | P1 | Indefinite token lifetime |
| No Rate Limiting | 🟡 MEDIUM | P1 | DoS, brute force |
| IP Logging Privacy | 🟢 LOW | P2 | Compliance issues |
| Unlimited Logging | 🟢 LOW | P2 | Storage costs |

---

## ✅ Immediate Actions Required

1. **🔴 CRITICAL:** Add authentication and authorization to token regeneration endpoint
2. **🟡 HIGH:** Add rate limiting to all token endpoints
3. **🟡 HIGH:** Limit auto-renewal frequency or add cooldown
4. **🟢 MEDIUM:** Implement log cleanup or retention policy
5. **🟢 MEDIUM:** Review IP logging for privacy compliance

---

## 🎯 Security Best Practices

1. **Always verify ownership** before allowing token operations
2. **Rate limit** all public endpoints
3. **Monitor** for suspicious patterns (rapid renewals, many failed attempts)
4. **Log** security events (failed auth, suspicious access)
5. **Encrypt or hash** sensitive logged data (IPs, tokens)
6. **Set limits** on resource usage (renewals, log size)
7. **Regular audits** of access patterns and security logs

---

## 🔍 Additional Considerations

### Token Sharing Security

**Current:** Once a token is shared, anyone with it can access the letter indefinitely (with auto-renewal).

**Consider:**
- One-time use tokens (expire after first access)
- Access count limits (max N accesses)
- Time-based access windows (only accessible during certain hours)

### Token Revocation

**Current:** Only letter owner can regenerate (after auth fix), which deactivates old token.

**Consider:**
- Revocation list endpoint
- Bulk revocation
- Scheduled revocation (auto-revoke after X days of inactivity)

### Monitoring & Alerting

**Recommend:**
- Alert on suspicious patterns (many regenerations, rapid access)
- Monitor token access frequency
- Track failed token attempts
- Dashboard for security metrics


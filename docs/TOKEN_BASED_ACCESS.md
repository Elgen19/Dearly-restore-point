# 🔐 Token-Based Letter Access - Implementation Guide

## Overview

The letter access system has been upgraded to use **secure token-based URLs** instead of exposing user IDs and letter IDs directly. This significantly improves security by:

- ✅ Preventing enumeration attacks
- ✅ Hiding user/letter IDs from URLs
- ✅ Supporting token expiration
- ✅ Enabling token revocation
- ✅ Tracking access attempts

## URL Format

### Current Format (Token-Based Only)
```
/letter/{token}
Example: /letter/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Token Format:** 64 hexadecimal characters (32 bytes)

### Legacy Format (DEPRECATED - No Longer Supported)
```
/letter/{userId}/{letterId}
```
**Status:** Removed for security reasons. All letter access must use token-based URLs.

## Implementation Details

### Backend Changes

#### 1. Token Generation (`letter-server/api/letters.js`)

When a letter is created, a secure token is automatically generated:

```javascript
// Token is generated using crypto.randomBytes(32)
const token = generateToken(); // 64 hex characters

// Stored in letterTokens collection
await db.ref(`letterTokens/${token}`).set({
  userId: userId,
  letterId: letterId,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
  isActive: true
});

// Also stored in letter for reference
await letterRef.update({ accessToken: token });
```

#### 2. Token-Based Access Endpoint

**New Endpoint:** `GET /api/letters/token/:token`

```javascript
router.get("/token/:token", checkFirebase, async (req, res) => {
  // 1. Fetch token data
  // 2. Verify token exists and is active
  // 3. Check expiration
  // 4. Fetch letter using userId/letterId from token
  // 5. Log access (optional)
  // 6. Return letter data
});
```

**Security Features:**
- ✅ Token validation
- ✅ Expiration checking (1 year default)
- ✅ Active/inactive status
- ✅ Access logging

#### 3. Legacy Endpoint (DEPRECATED)

The legacy endpoint `GET /api/letters/:userId/:letterId` has been **removed** for security reasons.

**Status:** Returns `410 Gone` with error message:
```json
{
  "message": "Legacy URL format is no longer supported. Please use token-based URLs for security.",
  "error": "DEPRECATED_ENDPOINT"
}
```

**All letter access must now use token-based URLs.**

### Frontend Changes

#### 1. Letter Creation (`letter-client/src/master/MasterLetterCraft.jsx`)

When a letter is created, the token is included in the response:

```javascript
const result = await response.json();
const token = result.token; // Get token from response
const link = `${baseUrl}/letter/${token}`; // Use token in URL
```

#### 2. URL Routing (`letter-client/src/main.jsx`)

Only token-based URLs are supported:

```javascript
// Token-based only: /letter/{64-hex-chars}
const letterTokenMatch = path.match(/^\/letter\/([a-f0-9]{64})$/);
```

#### 3. Letter Viewer (`letter-client/src/receiver-pages/LetterViewer.jsx`)

Only token-based access is supported:

```javascript
// Validate token format (64 hex chars)
if (!/^[a-f0-9]{64}$/i.test(userId)) {
  setError("Invalid token format. Token must be 64 hexadecimal characters.");
  return;
}

// Use token endpoint
response = await fetch(`${backendUrl}/api/letters/token/${userId}`);
```

#### 4. View All Letters (`letter-client/src/receiver-pages/ViewAllLetters.jsx`)

Only token-based URLs are supported:

```javascript
// Only token-based URLs are allowed
if (letter.accessToken && /^[a-f0-9]{64}$/i.test(letter.accessToken)) {
  letterUrl = `${baseUrl}/letter/${letter.accessToken}`;
} else {
  // Show error - legacy format no longer supported
  alert('This letter cannot be accessed. It may need to be regenerated with a secure token.');
}
```

## Database Structure

### Token Storage

```
letterTokens/
  {token}/
    userId: string
    letterId: string
    createdAt: ISO timestamp
    expiresAt: ISO timestamp
    isActive: boolean
    accessLog/
      {logId}/
        accessedAt: ISO timestamp
        ip: string
```

### Letter Storage (Updated)

```
users/
  {userId}/
    letters/
      {letterId}/
        ...
        accessToken: string (reference to token)
        shareableLink: string (token-based URL)
```

## Security Benefits

### 1. **No ID Exposure**
- User IDs and letter IDs are no longer visible in URLs
- Tokens are cryptographically random (cannot be guessed)

### 2. **Expiration Support**
- Tokens expire after 1 year (configurable)
- Expired tokens return 410 (Gone) status

### 3. **Revocation Support**
- Tokens can be deactivated by setting `isActive: false`
- Useful for revoking access to specific letters

### 4. **Access Tracking**
- All token accesses are logged (optional)
- Can track who viewed when (IP address)

### 5. **Enumeration Prevention**
- Random tokens make brute-force attacks impractical
- 64 hex characters = 2^256 possible combinations

## Migration Path

### ⚠️ Important: Legacy URLs No Longer Supported

**All legacy URLs have been removed for security reasons.** Letters without tokens cannot be accessed via the web interface.

### For Existing Letters Without Tokens

If you have existing letters that were created before token-based access was implemented:

1. **Option A: Regenerate Links**
   - Access letters through the master interface
   - Generate new shareable links (which will create tokens)
   - Update any saved/bookmarked links

2. **Option B: Batch Token Generation Script**
   - Create a migration script to generate tokens for all existing letters
   - Update all `shareableLink` fields with token-based URLs
   - See `MIGRATION_SCRIPT.md` for example implementation

### For New Letters

All new letters automatically get tokens - no action needed!

## API Endpoints

### Create Letter (Generates Token)
```
POST /api/letters/:userId
Response: {
  message: "Letter created successfully",
  letter: { ... },
  token: "a1b2c3d4..." // 64 hex characters
}
```

### Access Letter by Token (Recommended)
```
GET /api/letters/token/:token
Response: {
  id: "letterId",
  ...letterData,
  token: "a1b2c3d4..." // Included for reference
}
```

### Access Letter by ID (DEPRECATED - No Longer Available)
```
GET /api/letters/:userId/:letterId
Response: {
  "message": "Legacy URL format is no longer supported. Please use token-based URLs for security.",
  "error": "DEPRECATED_ENDPOINT"
}
Status: 410 Gone
```

## Error Handling

### Invalid Token
```json
{
  "message": "Invalid or expired link"
}
```
Status: 404

### Expired Token
```json
{
  "message": "Link has expired"
}
```
Status: 410 (Gone)

### Revoked Token
```json
{
  "message": "Link has been revoked"
}
```
Status: 410 (Gone)

## Configuration

### Token Expiration

Default: 1 year (365 days)

To change, modify in `letter-server/api/letters.js`:

```javascript
const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
// Change 365 to desired days
```

### Token Length

Current: 64 hex characters (32 bytes)

To change, modify `generateToken()`:

```javascript
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex'); // 32 bytes = 64 hex chars
};
```

## Testing

### Test Token-Based Access

1. Create a new letter
2. Copy the token from the response
3. Access: `http://localhost:5173/letter/{token}`
4. Should load the letter successfully

### Test Legacy Access (Should Fail)

1. Try to access: `http://localhost:5173/letter/{userId}/{letterId}`
2. Should show error: "Invalid link format. Expected: /letter/{token}. Legacy URLs are no longer supported for security."
3. Backend API should return: `410 Gone` with deprecation message

## Future Enhancements

Potential improvements:

1. **Shorter Tokens**: Use base64url encoding for shorter URLs
2. **Custom Expiration**: Allow users to set expiration per letter
3. **One-Time Tokens**: Tokens that expire after first use
4. **Password-Protected Tokens**: Additional security layer
5. **Analytics Dashboard**: View access statistics per token

## Security Best Practices

1. ✅ **Always use token-based URLs for sharing**
2. ✅ **Never expose userId/letterId in public URLs**
3. ✅ **Monitor access logs for suspicious activity**
4. ✅ **Revoke tokens if letter is deleted**
5. ✅ **Set appropriate expiration times**
6. ✅ **Use HTTPS in production** (tokens are still sensitive)

## Troubleshooting

### Token Not Working

1. Check token format (must be 64 hex characters)
2. Verify token exists in `letterTokens` collection
3. Check token expiration date
4. Verify `isActive` is `true`

### Legacy URLs Not Working

**Expected Behavior:** Legacy URLs are intentionally disabled for security.

If you see legacy URLs:
1. They will show error: "Legacy URLs are no longer supported"
2. Backend will return `410 Gone` status
3. **Solution:** Regenerate the letter link to get a token-based URL

### Letter Without Token

If a letter doesn't have a token:
1. Access the letter through the master interface
2. Generate a new shareable link (creates token automatically)
3. Use the new token-based URL


# 🔄 Token Expiration & Long-Term Access Solution

## Problem

Since tokens expire after 1 year, users need a way to revisit letters in the future without losing access.

## Solution

We've implemented **three mechanisms** to ensure long-term access:

### 1. **Auto-Renewal on Access** ✅

When a token is accessed and is within **30 days of expiration**, it automatically extends for another year.

**How it works:**
- User accesses letter via token
- System checks if token expires within 30 days
- If yes, automatically extends expiration by 1 year
- User continues to have access without interruption

**Implementation:**
```javascript
// In GET /api/letters/token/:token
const daysUntilExpiration = (expiresAt - now) / (1000 * 60 * 60 * 24);

if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
  // Auto-extend by 1 year
  const newExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  await tokenRef.update({ expiresAt: newExpiresAt });
}
```

**Benefits:**
- ✅ Seamless - no user action required
- ✅ Automatic - happens on every access
- ✅ Prevents expiration for actively used letters
- ✅ Extends only when needed (within 30 days)

### 2. **Token Regeneration** ✅

Letter owners can manually regenerate tokens for their letters at any time.

**How it works:**
- Letter owner clicks "🔄 Regenerate Link" button in MyLetters
- Old token is deactivated
- New token is generated with fresh 1-year expiration
- New shareable link is created

**API Endpoint:**
```
POST /api/letters/:userId/:letterId/regenerate-token
Response: {
  token: "new-token-here",
  shareableLink: "/letter/new-token-here",
  expiresAt: "2025-12-31T23:59:59.000Z"
}
```

**UI Location:**
- MyLetters → Select Letter → "🔄 Regenerate Link" button

**Benefits:**
- ✅ Manual control for letter owners
- ✅ Fresh expiration date (1 year from regeneration)
- ✅ Old token is deactivated (security)
- ✅ Can be done anytime, even before expiration

### 3. **Token Expiration Default** ✅

Tokens are created with **1 year expiration** by default, providing ample time for access.

**Current Settings:**
- Initial expiration: 1 year (365 days)
- Auto-renewal threshold: 30 days before expiration
- Regeneration: Creates new 1-year expiration

## User Scenarios

### Scenario 1: Regular Access (Auto-Renewal)
1. User creates letter → Token expires in 1 year
2. User accesses letter 11 months later
3. Token is within 30 days of expiration
4. **Auto-renewal extends token by 1 year**
5. User continues to have access

### Scenario 2: Infrequent Access (Regeneration)
1. User creates letter → Token expires in 1 year
2. User doesn't access for 2 years
3. Token has expired
4. User goes to MyLetters → Clicks "Regenerate Link"
5. **New token created with fresh 1-year expiration**
6. User can now access letter again

### Scenario 3: Proactive Regeneration
1. User creates letter → Token expires in 1 year
2. User wants to share link again (6 months later)
3. User goes to MyLetters → Clicks "Regenerate Link"
4. **New token created** (old one deactivated)
5. User shares new link with fresh expiration

## Technical Details

### Auto-Renewal Logic

**Trigger:** Token access within 30 days of expiration
**Action:** Extend expiration by 1 year from current date
**Logging:** Console logs when auto-renewal occurs

```javascript
if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
  const newExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  await tokenRef.update({ expiresAt: newExpiresAt });
  console.log(`🔄 Token auto-renewed: ${token.substring(0, 8)}...`);
}
```

### Token Regeneration Process

1. **Deactivate Old Token**
   ```javascript
   await oldTokenRef.update({ isActive: false });
   ```

2. **Generate New Token**
   ```javascript
   const newToken = generateToken(); // 64 hex characters
   ```

3. **Store New Token**
   ```javascript
   await tokenRef.set({
     userId, letterId,
     createdAt: new Date().toISOString(),
     expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
     isActive: true
   });
   ```

4. **Update Letter**
   ```javascript
   await letterRef.update({
     accessToken: newToken,
     shareableLink: `/letter/${newToken}`,
     updatedAt: new Date().toISOString()
   });
   ```

## Configuration

### Adjust Auto-Renewal Threshold

**Current:** 30 days before expiration

To change, modify in `letter-server/api/letters.js`:
```javascript
if (daysUntilExpiration <= 30 && daysUntilExpiration > 0) {
  // Change 30 to desired days
}
```

### Adjust Token Expiration Period

**Current:** 1 year (365 days)

To change, modify in `letter-server/api/letters.js`:
```javascript
const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
// Change 365 to desired days
```

## Security Considerations

### Old Token Deactivation

When regenerating:
- Old token is marked `isActive: false`
- Old token cannot be used to access letter
- Prevents multiple active tokens for same letter

### Token Access Logging

All token accesses are logged:
- Timestamp
- IP address
- Can be used for analytics/security monitoring

## Error Handling

### Expired Token Access

If token has already expired:
```json
{
  "message": "Link has expired"
}
```
Status: 410 Gone

**Solution:** User must regenerate token via MyLetters

### Deactivated Token Access

If token was deactivated (regenerated):
```json
{
  "message": "Link has been revoked"
}
```
Status: 410 Gone

**Solution:** User must use new token from regeneration

## Best Practices

1. **For Letter Owners:**
   - Regenerate token if you want to revoke old access
   - Regenerate token if expiration is approaching and you want fresh expiration
   - Share new link after regeneration

2. **For Letter Recipients:**
   - Bookmark the letter link
   - Access letter regularly (triggers auto-renewal)
   - Contact sender if link expires

3. **For Developers:**
   - Monitor auto-renewal logs
   - Track token regeneration frequency
   - Consider notifications for approaching expiration

## Future Enhancements

Potential improvements:

1. **Email Notifications**
   - Notify letter owner when token is expiring
   - Notify recipient when token is about to expire

2. **Expiration Options**
   - Allow users to set custom expiration (e.g., never expire)
   - Different expiration for different letter types

3. **Token Analytics**
   - Dashboard showing token usage
   - Expiration timeline visualization
   - Access frequency tracking

4. **Bulk Operations**
   - Regenerate tokens for all letters at once
   - Extend expiration for multiple letters

## Summary

✅ **Auto-Renewal:** Tokens automatically extend when accessed within 30 days of expiration
✅ **Manual Regeneration:** Letter owners can regenerate tokens anytime via UI
✅ **1-Year Default:** All tokens start with 1-year expiration
✅ **Security:** Old tokens are deactivated when regenerated
✅ **User-Friendly:** Seamless experience for both owners and recipients

**Result:** Users can revisit letters indefinitely through automatic renewal or manual regeneration! 🎉


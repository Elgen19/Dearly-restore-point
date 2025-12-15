# Firebase Realtime Database Security Rules

## 🔐 Updated Security Rules for New Structure

These rules match the database structure where all data is organized under `users/{userId}/`.

---

## 📋 Complete Security Rules

Copy and paste these rules into Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    "users": {
      // Users can only access their own data
      "$userId": {
        // User must be authenticated and accessing their own data
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        
        // User profile data (email, firstName, lastName, etc.)
        // Inherits read/write from parent ($userId)
        
        // Receiver data - only the user can read/write their receiver info
        "receiver": {
          ".read": "$userId === auth.uid",
          ".write": "$userId === auth.uid"
        },
        
        // Date invitations - only the user can read/write their own invitations
        "dateInvitations": {
          ".read": "$userId === auth.uid",
          ".write": "$userId === auth.uid",
          
          "$invitationId": {
            // Allow reading/writing individual invitations
            ".read": "$userId === auth.uid",
            ".write": "$userId === auth.uid",
            
            // Optional: Allow receiver to update status (if they have the invitation link)
            // This would require additional logic to verify receiver email
            "status": {
              ".write": "$userId === auth.uid || (data.parent().parent().child('receiverEmail').val() === auth.token.email && !data.exists())"
            }
          }
        },
        // Notifications - only the user can read/write their own notifications
        "notifications": {
          ".read": "$userId === auth.uid",
          ".write": "$userId === auth.uid",
          "$notificationId": {
            ".read": "$userId === auth.uid",
            ".write": "$userId === auth.uid"
          }
        }
      }
    },
    
    // Letter tokens - block all client access (backend-only via Admin SDK)
    // Tokens are managed by backend API for security
    "letterTokens": {
      ".read": false,
      ".write": false
    },
    
    // Deny all other paths
    "$other": {
      ".read": false,
      ".write": false
    }
  }
}
```

---

## 🔒 Simplified Rules (Backend-Only Access)

If you're using **only backend API** (recommended for production), you can restrict all client-side access:

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

**Note:** With these rules, only your backend server (using Firebase Admin SDK) can read/write data. This is the most secure option.

---

## 🛡️ Recommended Production Rules

For production with client-side access, use these rules:

```json
{
  "rules": {
    "users": {
      "$userId": {
        // Only authenticated users can access their own data
        ".read": "auth != null && $userId === auth.uid",
        ".write": "auth != null && $userId === auth.uid",
        
        // Receiver data
        "receiver": {
          ".read": "auth != null && $userId === auth.uid",
          ".write": "auth != null && $userId === auth.uid"
        },
        
        // Date invitations
        "dateInvitations": {
          ".read": "auth != null && $userId === auth.uid",
          ".write": "auth != null && $userId === auth.uid",
          
          "$invitationId": {
            ".read": "auth != null && $userId === auth.uid",
            ".write": "auth != null && $userId === auth.uid"
          }
        }
      }
    },
    
    // Letter tokens - block all client access (backend-only via Admin SDK)
    // Tokens are managed by backend API for security
    "letterTokens": {
      ".read": false,
      ".write": false
    },
    
    // Deny access to any other paths
    "$other": {
      ".read": false,
      ".write": false
    }
  }
}
```

---

## 📝 Rule Breakdown

### 1. User Data Protection
```json
"$userId": {
  ".read": "$userId === auth.uid",
  ".write": "$userId === auth.uid"
}
```
- **Meaning:** Users can only read/write data under their own user ID
- **Example:** User `abc123` can only access `users/abc123/`, not `users/xyz789/`

### 2. Receiver Data Protection
```json
"receiver": {
  ".read": "$userId === auth.uid",
  ".write": "$userId === auth.uid"
}
```
- **Meaning:** Only the owner can access their receiver data
- **Path:** `users/{userId}/receiver`

### 3. Date Invitations Protection
```json
"dateInvitations": {
  ".read": "$userId === auth.uid",
  ".write": "$userId === auth.uid"
}
```
- **Meaning:** Only the owner can access their date invitations
- **Path:** `users/{userId}/dateInvitations`

### 4. Deny Other Paths
```json
"$other": {
  ".read": false,
  ".write": false
}
```
- **Meaning:** Block access to any paths not explicitly allowed
- **Security:** Prevents access to root-level collections or invalid paths

---

## 🧪 Testing Rules

### Test in Firebase Console

1. Go to Firebase Console → Realtime Database → Rules
2. Click "Rules Playground"
3. Test scenarios:

**✅ Should Allow:**
- User `abc123` reading `users/abc123/receiver`
- User `abc123` writing `users/abc123/dateInvitations/-N123`

**❌ Should Deny:**
- User `abc123` reading `users/xyz789/receiver`
- Unauthenticated user reading `users/abc123/receiver`
- User `abc123` writing to root level

---

## 🚀 How to Apply Rules

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Realtime Database** → **Rules** tab

### Step 2: Update Rules
1. Copy the recommended production rules above
2. Paste into the rules editor
3. Click **Publish**

### Step 3: Verify
1. Check for syntax errors (Firebase will highlight them)
2. Test in Rules Playground
3. Monitor for any permission denied errors in your app

---

## ⚠️ Important Notes

1. **Backend API:** Your backend uses Firebase Admin SDK, which bypasses security rules. Rules only apply to client-side access.

2. **Authentication Required:** The rules require `auth.uid` to match `$userId`, so users must be authenticated.

3. **Test Mode:** If you're still in test mode, all rules are bypassed. Make sure to update from test mode to production rules.

4. **Gradual Rollout:** Test rules in a development environment first before applying to production.

---

## 🔄 Migration from Old Rules

If you had old rules for `dateInvitations` at root level:

**Old Rules:**
```json
{
  "rules": {
    "dateInvitations": {
      ".read": true,
      ".write": false
    }
  }
}
```

**New Rules:** (Use the recommended production rules above)

The old `dateInvitations` at root level will be denied access, which is correct since we moved them under `users/{userId}/dateInvitations/`.

---

## 📚 Additional Resources

- [Firebase Realtime Database Security Rules Documentation](https://firebase.google.com/docs/database/security)
- [Rules Playground](https://firebase.google.com/docs/database/security/test-rules)
- [Common Security Patterns](https://firebase.google.com/docs/database/security/core-syntax)


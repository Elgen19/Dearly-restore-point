# 🔐 How to Configure Firebase Realtime Database Security Rules

## Quick Start Guide

This guide walks you through configuring security rules for the new database structure where all data is organized under `users/{userId}/`.

---

## 📋 Step-by-Step Instructions

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Select your project from the project list

### Step 2: Navigate to Realtime Database Rules

1. In the left sidebar, click on **"Realtime Database"**
2. If you have multiple databases, select the one you're using (usually the default database)
3. Click on the **"Rules"** tab at the top

### Step 3: Choose Your Security Model

You have two options depending on your architecture:

#### Option A: Client-Side Access (Recommended for Most Cases)

If your frontend needs to read/write data directly, use these rules:

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

**What this does:**
- ✅ Users can only access their own data (`users/{theirUserId}/`)
- ✅ Authentication is required for all operations
- ✅ Prevents access to other users' data
- ✅ Blocks access to any paths not explicitly allowed

#### Option B: Backend-Only Access (Most Secure)

If you're using **only your backend API** (no direct client access), use these rules:

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

**What this does:**
- ✅ Blocks all client-side access
- ✅ Only your backend server (using Firebase Admin SDK) can access data
- ✅ Most secure option for production

**Note:** Your backend uses Firebase Admin SDK, which bypasses security rules. This is secure because your backend validates authentication and controls access.

---

### Step 4: Apply the Rules

1. **Copy** the rules you chose (Option A or B) from above
2. **Paste** them into the rules editor in Firebase Console
3. **Review** the rules for any syntax errors (Firebase will highlight them in red)
4. Click **"Publish"** button at the top right

### Step 5: Verify the Rules

#### Test in Rules Playground

1. In the Rules tab, click **"Rules Playground"** button
2. Test these scenarios:

**✅ Should Allow:**
- **Location:** `users/abc123/receiver`
- **Authenticated as:** `abc123`
- **Operation:** Read
- **Expected:** ✅ Allowed

- **Location:** `users/abc123/dateInvitations/-N123`
- **Authenticated as:** `abc123`
- **Operation:** Write
- **Expected:** ✅ Allowed

**❌ Should Deny:**
- **Location:** `users/xyz789/receiver`
- **Authenticated as:** `abc123` (different user)
- **Operation:** Read
- **Expected:** ❌ Denied

- **Location:** `users/abc123/receiver`
- **Authenticated as:** (unauthenticated)
- **Operation:** Read
- **Expected:** ❌ Denied

- **Location:** `dateInvitations` (root level)
- **Authenticated as:** `abc123`
- **Operation:** Read
- **Expected:** ❌ Denied

---

## 🔍 Understanding the Rules

### Rule Structure Breakdown

```json
"users": {
  "$userId": {
    ".read": "auth != null && $userId === auth.uid",
    ".write": "auth != null && $userId === auth.uid"
  }
}
```

- **`users`**: Top-level collection for all user data
- **`$userId`**: Wildcard variable that matches any user ID
- **`auth != null`**: Requires user to be authenticated
- **`$userId === auth.uid`**: Ensures user can only access their own data
- **`.read`**: Controls read permissions
- **`.write`**: Controls write permissions

### Path Matching

Rules apply to paths and their children:
- `users/abc123/` → Matches `$userId = "abc123"`
- `users/abc123/receiver` → Inherits from parent + specific rule
- `users/abc123/dateInvitations/-N123` → Nested wildcard matching

---

## ⚠️ Important Notes

### 1. Backend Access
Your backend API uses **Firebase Admin SDK**, which **bypasses security rules**. This is intentional and secure because:
- Your backend validates authentication via API tokens
- Your backend controls what data can be accessed
- Client-side rules provide an additional security layer

### 2. Test Mode
If your database is in **test mode**, all rules are bypassed. Make sure to:
- Switch from test mode to production mode
- Apply the security rules above

### 3. Migration from Old Rules
If you had old rules (e.g., `dateInvitations` at root level), they will be denied access, which is correct since data is now under `users/{userId}/dateInvitations/`.

### 4. Gradual Rollout
- Test rules in a development environment first
- Monitor for permission denied errors in your app
- Use Rules Playground to verify before deploying

---

## 🚨 Troubleshooting

### Issue: "Permission Denied" Errors

**Possible causes:**
1. User is not authenticated
2. User is trying to access another user's data
3. Rules syntax error

**Solution:**
- Check that users are properly authenticated
- Verify the user ID matches `auth.uid`
- Check Rules Playground for specific path access

### Issue: Rules Not Saving

**Possible causes:**
1. JSON syntax error
2. Invalid rule expression

**Solution:**
- Firebase Console will highlight syntax errors in red
- Check for missing commas, brackets, or quotes
- Validate JSON format

### Issue: Backend Can't Access Data

**This shouldn't happen** because:
- Firebase Admin SDK bypasses security rules
- If it does happen, check your Firebase Admin SDK configuration
- Verify service account credentials are correct

---

## 📚 Additional Resources

- **Detailed Documentation:** See `FIREBASE_SECURITY_RULES.md` for comprehensive rule explanations
- **Database Structure:** See `DATABASE_HIERARCHY.md` for database organization
- **Firebase Docs:** [Realtime Database Security Rules](https://firebase.google.com/docs/database/security)
- **Rules Playground:** [Test Rules](https://firebase.google.com/docs/database/security/test-rules)

---

## ✅ Checklist

Before deploying to production:

- [ ] Rules are copied and pasted correctly
- [ ] No syntax errors (Firebase Console shows no red highlights)
- [ ] Rules Playground tests pass
- [ ] Tested with authenticated users
- [ ] Tested that users cannot access other users' data
- [ ] Verified backend still works (Admin SDK bypasses rules)
- [ ] Monitored for permission denied errors after deployment

---

## 🎯 Quick Reference

**Recommended Production Rules (Client Access):**
```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null && $userId === auth.uid",
        ".write": "auth != null && $userId === auth.uid",
        "receiver": {
          ".read": "auth != null && $userId === auth.uid",
          ".write": "auth != null && $userId === auth.uid"
        },
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
    "letterTokens": {
      ".read": false,
      ".write": false
    },
    "$other": {
      ".read": false,
      ".write": false
    }
  }
}
```

**Backend-Only Rules (Most Secure):**
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```


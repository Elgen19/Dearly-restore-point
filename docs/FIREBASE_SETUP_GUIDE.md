# Firebase Realtime Database Setup Guide for Date Invitations

## Database Structure Recommendation

```
dateInvitations/
  ├── {invitationId}/
  │   ├── id: string (auto-generated)
  │   ├── date: string (ISO format: "2024-02-14")
  │   ├── time: string ("19:00")
  │   ├── location: string
  │   ├── message: string
  │   ├── status: "pending" | "accepted" | "declined"
  │   ├── createdAt: string (ISO timestamp)
  │   ├── rsvpMessage: string (optional, user's response message)
  │   └── rsvpAt: string (ISO timestamp, when user responded)
```

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Realtime Database** (not Firestore)
4. Start in **test mode** for now (we'll add security rules later)

### 2. Get Firebase Credentials
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key" to download service account JSON
3. Save this file securely (add to .gitignore!)

### 3. Security Rules (Recommended)
```json
{
  "rules": {
    "dateInvitations": {
      ".read": true,  // Allow reading (can restrict later)
      ".write": false,  // Only allow writes through backend
      "$invitationId": {
        ".write": "!data.exists() || data.child('status').val() === 'pending'"
      }
    }
  }
}
```

## Implementation Options

### Option A: Backend with Firebase Admin SDK (RECOMMENDED)
- ✅ More secure (credentials stay on server)
- ✅ Better for production
- ✅ Can add authentication/authorization easily

### Option B: Client-side Firebase SDK
- ✅ Simpler setup
- ✅ Real-time updates automatically
- ❌ Less secure (API keys exposed)
- ❌ Better for prototyping

---

## Option A: Backend Implementation (Recommended)

### Step 1: Install Firebase Admin SDK
```bash
cd letter-server
npm install firebase-admin
```

### Step 2: Create Firebase Config
Create `letter-server/configs/firebase.js` with your service account credentials.

### Step 3: Create API Endpoints
- GET `/api/date-invitations` - Fetch all invitations
- PUT `/api/date-invitations/:id/rsvp` - Update RSVP status

### Step 4: Update React Component
Replace dummy data with API calls to your backend.

---

## Option B: Client-side Implementation (Simpler)

### Step 1: Install Firebase SDK
```bash
cd letter-client
npm install firebase
```

### Step 2: Create Firebase Config
Create `letter-client/src/config/firebase.js` with your Firebase config.

### Step 3: Update Component
Use Firebase Realtime Database directly in React component with `onValue` listeners.

---

## Recommendation

**Use Option A (Backend)** because:
1. Your API keys stay secure on the server
2. You can add email notifications when RSVP is submitted
3. Better for scaling and adding features later
4. Consistent with your existing backend architecture

Would you like me to implement Option A or Option B?


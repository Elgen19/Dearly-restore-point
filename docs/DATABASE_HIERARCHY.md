# Firebase Realtime Database Hierarchy Guide

## 📊 Complete Database Structure

```
your-project-default-rtdb.firebaseio.com/
│
└── users/                          ← All users (senders)
    └── {userId}/                   ← Sender's Firebase Auth UID (e.g., "abc123xyz")
        │
        ├── email: "sender@example.com"           ← Sender's profile data
        ├── firstName: "John"                     ← Sender's profile data
        ├── lastName: "Doe"                       ← Sender's profile data
        ├── emailVerified: true/false             ← Sender's profile data
        ├── createdAt: "2024-01-10T08:00:00.000Z"  ← Sender's profile data
        ├── updatedAt: "2024-01-10T08:00:00.000Z" ← Sender's profile data
        ├── verifiedAt: "2024-01-10T09:00:00.000Z" ← Sender's profile data
        │
        ├── receiver/                              ← Receiver data (who receives letters)
        │   ├── name: "Faith"
        │   ├── email: "faith@example.com"
        │   ├── createdAt: "2024-01-15T10:30:00.000Z"
        │   └── updatedAt: "2024-01-15T10:30:00.000Z"
        │
        └── dateInvitations/                      ← Date invitations (user-specific)
            └── {invitationId}/                   ← Auto-generated ID (e.g., "-N123abc456")
                ├── date: "2024-12-25"
                ├── time: "19:00"
                ├── location: "Romantic Restaurant"
                ├── message: "I'd love to spend Christmas with you! 💕"
                ├── status: "pending" | "accepted" | "declined"
                ├── receiverEmail: "faith@example.com"  ← Link to receiver
                ├── createdAt: "2024-01-01T00:00:00.000Z"
                ├── rsvpMessage: "Looking forward to it!" (optional)
                └── rsvpAt: "2024-01-02T10:30:00.000Z" (optional)
```

---

## 🔑 Understanding Paths

### Path Syntax
Firebase Realtime Database uses **paths** (like file system paths) to access data:

```
users/{userId}/receiver
```

This means:
- `users` = top-level node
- `{userId}` = user's unique ID (Firebase Auth UID)
- `receiver` = the data object for that user's receiver

### How Paths Work in Code

```javascript
// Get reference to a specific path
const receiverRef = db.ref(`users/${userId}/receiver`);

// This creates a path like:
// users/abc123xyz/receiver
```

---

## 📁 Detailed Structure Examples

### 1. Users Structure

**Path:** `users/{userId}` (sender profile) and `users/{userId}/receiver` (receiver data)

**Example with real data:**
```json
{
  "users": {
    "abc123xyz789": {
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true,
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-10T08:00:00.000Z",
      "verifiedAt": "2024-01-10T09:00:00.000Z",
      "receiver": {
        "name": "Faith",
        "email": "faith@example.com",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    },
    "def456uvw012": {
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "emailVerified": true,
      "createdAt": "2024-01-11T10:00:00.000Z",
      "updatedAt": "2024-01-11T10:00:00.000Z",
      "verifiedAt": "2024-01-11T11:00:00.000Z",
      "receiver": {
        "name": "Sarah",
        "email": "sarah@example.com",
        "createdAt": "2024-01-16T14:20:00.000Z",
        "updatedAt": "2024-01-16T14:20:00.000Z"
      }
    }
  }
}
```

**How to access:**
- **Full path:** `users/abc123xyz789/receiver`
- **In code:** `db.ref('users/' + userId + '/receiver')`
- **API endpoint:** `POST /api/receiver-data/abc123xyz789`

---

### 2. Date Invitations Structure

**Path:** `users/{userId}/dateInvitations/{invitationId}` (user-specific)

Date invitations are stored under each sender's user node, making them private and organized per user.

**Example with real data:**
```json
{
  "users": {
    "abc123xyz789": {
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true,
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-10T08:00:00.000Z",
      "verifiedAt": "2024-01-10T09:00:00.000Z",
      "receiver": {
        "name": "Faith",
        "email": "faith@example.com",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      "dateInvitations": {
        "-N123abc456": {
          "date": "2024-12-25",
          "time": "19:00",
          "location": "Romantic Restaurant",
          "message": "I'd love to spend Christmas with you! 💕",
          "status": "pending",
          "receiverEmail": "faith@example.com",
          "createdAt": "2024-01-01T00:00:00.000Z"
        },
        "-N789def012": {
          "date": "2024-02-14",
          "time": "18:00",
          "location": "Beach Sunset",
          "message": "Valentine's Day surprise!",
          "status": "accepted",
          "receiverEmail": "faith@example.com",
          "createdAt": "2024-01-10T09:00:00.000Z",
          "rsvpMessage": "Can't wait!",
          "rsvpAt": "2024-01-11T15:30:00.000Z"
        }
      }
    }
  }
}
```

**Benefits:**
- ✅ Each sender can see their own invitations
- ✅ Easy to query: `users/{userId}/dateInvitations`
- ✅ Better organization and privacy
- ✅ All user data (profile, receiver, invitations) in one place

**How to access:**
- **Full path:** `users/abc123xyz789/dateInvitations/-N123abc456`
- **In code:** `db.ref('users/' + userId + '/dateInvitations/' + invitationId)`
- **API endpoint:** `GET /api/users/abc123xyz789/date-invitations/-N123abc456`
- **Get all invitations for a user:** `GET /api/users/abc123xyz789/date-invitations`

---

## 🗺️ Visual Tree Representation

```
Firebase Realtime Database (Root)
│
├─ users/                                    [Collection of all users (senders)]
│  │
│  ├─ abc123xyz789/                          [Sender 1 - Firebase Auth UID]
│  │  │
│  │  ├─ email: "john@example.com"           [Sender's profile]
│  │  ├─ firstName: "John"                  [Sender's profile]
│  │  ├─ lastName: "Doe"                    [Sender's profile]
│  │  ├─ emailVerified: true                [Sender's profile]
│  │  ├─ createdAt: "2024-01-10T08:00:00.000Z" [Sender's profile]
│  │  ├─ updatedAt: "2024-01-10T08:00:00.000Z" [Sender's profile]
│  │  ├─ verifiedAt: "2024-01-10T09:00:00.000Z" [Sender's profile]
│  │  │
│  │  ├─ receiver/                           [Receiver data - who receives letters]
│  │  │  ├─ name: "Faith"
│  │  │  ├─ email: "faith@example.com"
│  │  │  ├─ createdAt: "2024-01-15T10:30:00.000Z"
│  │  │  └─ updatedAt: "2024-01-15T10:30:00.000Z"
│  │  │
│  │  └─ dateInvitations/                    [Sender's date invitations]
│  │     ├─ -N123abc456/                     [Invitation 1 - Auto-generated ID]
│  │     │  ├─ date: "2024-12-25"
│  │     │  ├─ time: "19:00"
│  │     │  ├─ location: "Romantic Restaurant"
│  │     │  ├─ message: "I'd love to spend Christmas with you! 💕"
│  │     │  ├─ status: "pending"
│  │     │  ├─ receiverEmail: "faith@example.com"
│  │     │  └─ createdAt: "2024-01-01T00:00:00.000Z"
│  │     │
│  │     └─ -N789def012/                     [Invitation 2 - Auto-generated ID]
│  │        ├─ date: "2024-02-14"
│  │        ├─ time: "18:00"
│  │        ├─ location: "Beach Sunset"
│  │        ├─ message: "Valentine's Day surprise!"
│  │        ├─ status: "accepted"
│  │        ├─ receiverEmail: "faith@example.com"
│  │        ├─ createdAt: "2024-01-10T09:00:00.000Z"
│  │        ├─ rsvpMessage: "Can't wait!"
│  │        └─ rsvpAt: "2024-01-11T15:30:00.000Z"
│  │
│  ├─ def456uvw012/                          [Sender 2 - Firebase Auth UID]
│  │  │
│  │  ├─ email: "jane@example.com"           [Sender's profile]
│  │  ├─ firstName: "Jane"                  [Sender's profile]
│  │  ├─ lastName: "Smith"                   [Sender's profile]
│  │  ├─ emailVerified: true                [Sender's profile]
│  │  ├─ createdAt: "2024-01-11T10:00:00.000Z" [Sender's profile]
│  │  ├─ updatedAt: "2024-01-11T10:00:00.000Z" [Sender's profile]
│  │  ├─ verifiedAt: "2024-01-11T11:00:00.000Z" [Sender's profile]
│  │  │
│  │  ├─ receiver/                           [Receiver data]
│  │  │  ├─ name: "Sarah"
│  │  │  ├─ email: "sarah@example.com"
│  │  │  ├─ createdAt: "2024-01-16T14:20:00.000Z"
│  │  │  └─ updatedAt: "2024-01-16T14:20:00.000Z"
│  │  │
│  │  └─ dateInvitations/                    [Sender's date invitations]
│  │     └─ -N456ghi789/                     [Invitation 1 - Auto-generated ID]
│  │        ├─ date: "2024-03-20"
│  │        ├─ time: "20:00"
│  │        ├─ location: "Fancy Restaurant"
│  │        ├─ message: "Let's celebrate! 💕"
│  │        ├─ status: "pending"
│  │        ├─ receiverEmail: "sarah@example.com"
│  │        └─ createdAt: "2024-01-20T10:00:00.000Z"
│  │
│  └─ xyz789abc123/                          [Sender 3 - Firebase Auth UID]
│     │
│     ├─ email: "bob@example.com"            [Sender's profile]
│     ├─ firstName: "Bob"                    [Sender's profile]
│     ├─ lastName: "Wilson"                  [Sender's profile]
│     ├─ emailVerified: false                [Sender's profile]
│     ├─ createdAt: "2024-01-12T12:00:00.000Z" [Sender's profile]
│     ├─ updatedAt: "2024-01-12T12:00:00.000Z" [Sender's profile]
│     ├─ verifiedAt: null                    [Sender's profile]
│     │
│     └─ (no receiver or invitations yet - user hasn't set up)
│
└─ (All data is under users/ - no root-level collections)
```

---

## 🔍 How to Read This Structure

### Key Concepts:

1. **Root Level** (`/`)
   - The top of the database
   - Contains the `users` collection (all other data is nested under users)

2. **Collections** (`users`)
   - The main collection containing all user data
   - Each user has their profile, receiver, and date invitations

3. **Documents/Nodes** (`{userId}`, `{invitationId}`)
   - Individual items within a collection
   - Identified by unique keys (UIDs or auto-generated IDs)

4. **Fields/Properties** (`name`, `email`, `date`, etc.)
   - The actual data stored in each document
   - Can be strings, numbers, booleans, objects, arrays

---

## 💻 Code Examples

### Reading Data

```javascript
// Read receiver data for a specific user
const receiverRef = db.ref(`users/${userId}/receiver`);
const snapshot = await receiverRef.once("value");
const receiverData = snapshot.val();
// Returns: { name: "Faith", email: "faith@example.com", ... }
```

### Writing Data

```javascript
// Save receiver data
const receiverRef = db.ref(`users/${userId}/receiver`);
await receiverRef.set({
  name: "Faith",
  email: "faith@example.com",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
```

### Updating Data

```javascript
// Update only specific fields
const receiverRef = db.ref(`users/${userId}/receiver`);
await receiverRef.update({
  name: "Faith Updated",
  updatedAt: new Date().toISOString()
});
```

### Working with Date Invitations

```javascript
// Create a new date invitation
const invitationsRef = db.ref(`users/${userId}/dateInvitations`);
const newInvitationRef = invitationsRef.push();
await newInvitationRef.set({
  date: "2024-12-25",
  time: "19:00",
  location: "Romantic Restaurant",
  message: "I'd love to spend Christmas with you! 💕",
  status: "pending",
  receiverEmail: "faith@example.com",
  createdAt: new Date().toISOString()
});

// Get all invitations for a user
const invitationsRef = db.ref(`users/${userId}/dateInvitations`);
const snapshot = await invitationsRef.once("value");
const invitations = snapshot.val();
// Returns: { "-N123abc456": { ... }, "-N789def012": { ... } }

// Get a specific invitation
const invitationRef = db.ref(`users/${userId}/dateInvitations/${invitationId}`);
const snapshot = await invitationRef.once("value");
const invitation = snapshot.val();

// Update invitation status (RSVP)
const invitationRef = db.ref(`users/${userId}/dateInvitations/${invitationId}`);
await invitationRef.update({
  status: "accepted",
  rsvpMessage: "Can't wait!",
  rsvpAt: new Date().toISOString()
});
```

---

## 🎯 Real-World Example

Let's say you have:
- **Sender (User):** John Doe with Firebase Auth UID `abc123xyz`
- **Sender's Email:** `john@example.com`
- **Receiver Name:** "Faith"
- **Receiver Email:** "faith@example.com"

**The complete structure in Firebase:**
```
users/abc123xyz/
  ├── email: "john@example.com"              ← Sender's profile
  ├── firstName: "John"                       ← Sender's profile
  ├── lastName: "Doe"                        ← Sender's profile
  ├── emailVerified: true                    ← Sender's profile
  ├── createdAt: "2024-01-10T08:00:00.000Z"  ← Sender's profile
  ├── updatedAt: "2024-01-10T08:00:00.000Z"  ← Sender's profile
  ├── verifiedAt: "2024-01-10T09:00:00.000Z" ← Sender's profile
  │
  ├── receiver/                               ← Receiver data
  │   ├── name: "Faith"
  │   ├── email: "faith@example.com"
  │   ├── createdAt: "2024-01-15T10:30:00.000Z"
  │   └── updatedAt: "2024-01-15T10:30:00.000Z"
  │
  └── dateInvitations/                        ← Date invitations
      └── -N123abc456/
          ├── date: "2024-12-25"
          ├── time: "19:00"
          ├── location: "Romantic Restaurant"
          ├── message: "I'd love to spend Christmas with you! 💕"
          ├── status: "pending"
          ├── receiverEmail: "faith@example.com"
          └── createdAt: "2024-01-20T10:00:00.000Z"
```

**In Firebase Console, you'll see:**
```
users
  └── abc123xyz
      ├── email: "john@example.com"
      ├── firstName: "John"
      ├── lastName: "Doe"
      ├── emailVerified: true
      ├── createdAt: "2024-01-10T08:00:00.000Z"
      ├── updatedAt: "2024-01-10T08:00:00.000Z"
      ├── verifiedAt: "2024-01-10T09:00:00.000Z"
      ├── receiver
      │   ├── name: "Faith"
      │   ├── email: "faith@example.com"
      │   ├── createdAt: "2024-01-15T10:30:00.000Z"
      │   └── updatedAt: "2024-01-15T10:30:00.000Z"
      └── dateInvitations
          └── -N123abc456
              ├── date: "2024-12-25"
              ├── time: "19:00"
              ├── location: "Romantic Restaurant"
              ├── message: "I'd love to spend Christmas with you! 💕"
              ├── status: "pending"
              ├── receiverEmail: "faith@example.com"
              └── createdAt: "2024-01-20T10:00:00.000Z"
```

**To access receiver data via API:**
```
POST http://localhost:5000/api/receiver-data/abc123xyz
Body: { "name": "Faith", "email": "faith@example.com" }
```

**To read receiver data:**
```
GET http://localhost:5000/api/receiver-data/abc123xyz
```

**To create a date invitation:**
```
POST http://localhost:5000/api/users/abc123xyz/date-invitations
Body: {
  "date": "2024-12-25",
  "time": "19:00",
  "location": "Romantic Restaurant",
  "message": "I'd love to spend Christmas with you! 💕"
}
```

**To get all date invitations for a user:**
```
GET http://localhost:5000/api/users/abc123xyz/date-invitations
```

---

## 📝 Summary

### Key Points:

1. **Sender Profile** (`users/{userId}`)
   - Contains the sender's (user's) own profile data
   - Fields: `email`, `firstName`, `lastName`, `emailVerified`, `createdAt`, `updatedAt`, `verifiedAt`
   - Created when user signs up

2. **Receiver Data** (`users/{userId}/receiver`)
   - Contains information about who receives letters from this sender
   - Fields: `name`, `email`, `createdAt`, `updatedAt`
   - Created when sender sets up their receiver
   - **One receiver per sender** (private data)

3. **Date Invitations** (`users/{userId}/dateInvitations/{invitationId}`)
   - Stored under each sender's user node (user-specific)
   - Each invitation is created by a sender and sent to their receiver
   - Contains: `date`, `time`, `location`, `message`, `status`, `receiverEmail`, `createdAt`, etc.
   - **One invitation collection per sender** (private data)

### Structure Rules:

- **Paths** work like file system paths: `/collection/document/field`
- **All data is organized under users** - no root-level collections except `users`
- **Each sender** has their own:
  - Profile data (`users/{userId}/`)
  - Receiver data (`users/{userId}/receiver/`)
  - Date invitations (`users/{userId}/dateInvitations/`)
- **All user data is private** and stored under their Firebase Auth UID
- The **sender** is the one who writes letters and creates invitations, the **receiver** is who receives them

---

## 🔐 Security Rules

### Recommended Production Rules

For the new structure where all data is under `users/{userId}/`, use these Firebase Security Rules:

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
    
    // Deny access to any other paths
    "$other": {
      ".read": false,
      ".write": false
    }
  }
}
```

### How to Apply

1. Go to Firebase Console → Realtime Database → Rules
2. Copy the rules above
3. Paste and click **Publish**

### What These Rules Do

- ✅ **User Isolation:** Each user can only access their own data (`$userId === auth.uid`)
- ✅ **Authentication Required:** All access requires authentication (`auth != null`)
- ✅ **Private Data:** Receiver and date invitations are private to each user
- ✅ **Block Other Paths:** Denies access to any paths not explicitly allowed

### Backend Access

**Note:** Your backend API uses Firebase Admin SDK, which bypasses security rules. Rules only apply to client-side access. This is secure because:
- Backend validates user authentication via API
- Backend controls what data can be accessed
- Client-side rules provide an additional security layer

For more details, see `FIREBASE_SECURITY_RULES.md`.


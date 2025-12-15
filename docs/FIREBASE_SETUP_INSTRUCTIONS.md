# Firebase Realtime Database Setup Instructions

## Quick Start Guide

### Step 1: Install Dependencies
```bash
cd letter-server
npm install firebase-admin
```

### Step 2: Set Up Firebase Project

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name (e.g., "project-love")
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Realtime Database**
   - In Firebase Console, go to "Realtime Database"
   - Click "Create Database"
   - Choose location (closest to your users)
   - Start in **Test mode** (we'll update rules later)
   - Click "Enable"

3. **Get Database URL**
   - Copy the database URL (e.g., `https://your-project-default-rtdb.firebaseio.com`)
   - Save this for your `.env` file

### Step 3: Get Service Account Credentials

**Option A: Using Environment Variables (Recommended for Production)**

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Open the JSON file and extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters!)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
5. Add these to your `letter-server/.env` file

**Option B: Using Service Account File (Easier for Local Dev)**

1. Download the service account JSON file
2. Save it as `letter-server/configs/serviceAccountKey.json`
3. Update `letter-server/configs/firebase.js` to use the file path
4. **IMPORTANT:** Add `configs/serviceAccountKey.json` to `.gitignore`!

### Step 4: Configure Environment Variables

Create or update `letter-server/.env`:

```env
PORT=5000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

**Important Notes:**
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Keep the `\n` characters in the private key
- Never commit `.env` file to git!

### Step 5: Set Up Security Rules

1. Go to Firebase Console → Realtime Database → Rules
2. Update rules to match the new structure (all data under `users/{userId}/`):

**Recommended Production Rules:**
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

**Or, if using backend-only access (most secure):**
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

This ensures:
- ✅ Each user can only access their own data
- ✅ Authentication is required
- ✅ All user data is private
- ✅ Backend API (using Admin SDK) can still access all data

For detailed security rules documentation, see `FIREBASE_SECURITY_RULES.md`.

### Step 6: Test the Setup

1. Start your server:
```bash
cd letter-server
npm run dev
```

2. You should see: `✅ Firebase Admin SDK initialized successfully`

3. Test the API:
```bash
# Get all invitations
curl http://localhost:5000/api/date-invitations

# Create a test invitation
curl -X POST http://localhost:5000/api/date-invitations \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-12-25",
    "time": "19:00",
    "location": "Test Location",
    "message": "Test invitation"
  }'
```

### Step 7: Create Test Data (Optional)

You can create test invitations via the API or directly in Firebase Console:

1. Go to Firebase Console → Realtime Database
2. Click "Add child"
3. Add a key like `test-invitation-1`
4. Add fields:
   - `date`: "2024-12-25"
   - `time`: "19:00"
   - `location`: "Romantic Restaurant"
   - `message`: "I'd love to spend Christmas with you! 💕"
   - `status`: "pending"
   - `createdAt`: "2024-01-01T00:00:00.000Z"

## Database Structure

```
dateInvitations/
  ├── {auto-generated-id}/
  │   ├── date: "2024-12-25"
  │   ├── time: "19:00"
  │   ├── location: "Romantic Restaurant"
  │   ├── message: "I'd love to spend Christmas with you! 💕"
  │   ├── status: "pending" | "accepted" | "declined"
  │   ├── createdAt: "2024-01-01T00:00:00.000Z"
  │   ├── rsvpMessage: "Optional user message" (only if user added one)
  │   └── rsvpAt: "2024-01-02T10:30:00.000Z" (when user responded)
```

## API Endpoints

- `GET /api/date-invitations` - Get all invitations
- `GET /api/date-invitations/:id` - Get specific invitation
- `PUT /api/date-invitations/:id/rsvp` - Update RSVP status
- `POST /api/date-invitations` - Create new invitation (for admin/testing)

## Troubleshooting

### "Firebase Admin SDK initialized" warning
- Check that all Firebase env variables are set in `.env`
- Verify the private key format (keep `\n` characters)

### "Permission denied" errors
- Check Firebase security rules
- Verify service account has proper permissions

### "Database URL not found"
- Verify `FIREBASE_DATABASE_URL` is correct
- Make sure Realtime Database is enabled in Firebase Console

## Next Steps

1. ✅ Set up Firebase
2. ✅ Configure environment variables
3. ✅ Test API endpoints
4. ✅ Create test invitations
5. 🎉 Start using the date invitation feature!


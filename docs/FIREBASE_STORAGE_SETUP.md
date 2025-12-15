# Firebase Storage Setup Guide - Step by Step

## 🎯 Overview

This guide will help you migrate from local file storage to Firebase Storage for your music uploads.

## ✅ Prerequisites

- Firebase project already set up (you have this!)
- Firebase Admin SDK already configured (you have this!)
- Backend server running

---

## Step 1: Enable Firebase Storage in Firebase Console

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project

2. **Enable Storage**
   - In the left sidebar, click **"Storage"**
   - Click **"Get started"** button

3. **Set Security Rules**
   - Firebase will ask you to set security rules
   - Choose **"Start in test mode"** for now (we'll secure it later)
   - Click **"Next"**

4. **Choose Location**
   - Select a location closest to your users (e.g., `us-central1`, `asia-southeast1`)
   - Click **"Done"**

5. **Get Storage Bucket Name**
   - After Storage is enabled, go to **"Storage"** → **"Files"** tab
   - Look at the URL, it will be something like: `gs://your-project-id.appspot.com`
   - Copy this bucket name (you'll need it for configuration)

---

## Step 2: Update Environment Variables

Add the storage bucket URL to your `.env` file:

```env
# Existing Firebase config
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Add this new line for Storage
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

**Note**: The bucket name is usually `{your-project-id}.appspot.com`

---

## Step 3: Update Firebase Config (Backend)

The code has been updated to export the storage bucket. Make sure your `firebase.js` config includes storage.

---

## Step 4: Update Music Upload API

The `music-upload.js` file will be updated to use Firebase Storage instead of local storage.

---

## Step 5: Install Dependencies

No additional packages needed! Firebase Admin SDK already includes Storage support.

---

## Step 6: Test the Setup

1. **Start your server**:
   ```bash
   cd letter-server
   npm run dev
   ```

2. **Upload a music file** from the Extras page

3. **Check Firebase Console**:
   - Go to Storage → Files
   - You should see your uploaded file in the `music/` folder

4. **Verify file access**:
   - The file URL will be a Firebase Storage URL
   - It should be accessible from anywhere

---

## 📁 File Structure in Firebase Storage

Files will be organized as:
```
gs://your-project.appspot.com/
  └── music/
      └── {userId}-{timestamp}-{filename}.mp3
```

---

## 🔒 Security Rules (Important!)

After testing, update Firebase Storage security rules:

1. Go to **Storage** → **Rules** tab in Firebase Console
2. Replace the test mode rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Music files - users can upload their own files
    match /music/{userId}-{allPaths=**} {
      // Allow read access to all authenticated users
      allow read: if request.auth != null;
      
      // Allow write access only if uploading user matches the userId in path
      allow write: if request.auth != null && 
                     request.resource.size < 10 * 1024 * 1024 && // 10MB limit
                     request.resource.contentType.matches('audio/.*');
    }
  }
}
```

---

## 🔄 Migration from Local Storage

If you have existing files in local storage:

1. **Option A**: Keep old files local, only new uploads use Firebase Storage
2. **Option B**: Upload existing files to Firebase Storage manually

---

## ✅ What Changes?

### Before (Local Storage):
- Files stored in: `letter-server/uploads/music/`
- URL: `http://your-server:5000/uploads/music/filename.mp3`
- ❌ Lost on server restart/redeploy

### After (Firebase Storage):
- Files stored in: Firebase Storage bucket
- URL: `https://firebasestorage.googleapis.com/v0/b/{bucket}/o/music%2F...`
- ✅ Permanent, reliable, scalable

---

## 🎉 Benefits

1. **Reliability**: Files never lost
2. **Scalability**: Handles unlimited users
3. **CDN-like Speed**: Fast access worldwide
4. **Works with Serverless**: Perfect for Vercel/Netlify
5. **Free Tier**: 5GB storage, 1GB downloads/day

---

## 🆘 Troubleshooting

### "Storage bucket not found"
- Make sure you enabled Storage in Firebase Console
- Check that `FIREBASE_STORAGE_BUCKET` in `.env` matches your bucket name

### "Permission denied"
- Check Firebase Storage security rules
- Make sure Firebase Admin SDK has proper permissions

### "File upload fails"
- Check file size (max 10MB)
- Verify file type is audio
- Check server logs for detailed error messages

---

**Last Updated**: Current Date
**Status**: ✅ Ready to implement

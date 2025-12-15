# Firebase Authentication Setup Guide for Dearly

This guide will help you set up Firebase Authentication for the Dearly master app.

## Step 1: Create Firebase Project (if you haven't already)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** in the left sidebar
2. Click **Get Started**
3. Go to the **Sign-in method** tab
4. Enable the following sign-in providers:

### Enable Email/Password Authentication
1. Click on **Email/Password**
2. Toggle **Enable** to ON
3. Click **Save**

### Enable Google Sign-In
1. Click on **Google**
2. Toggle **Enable** to ON
3. Select a support email (your email)
4. Click **Save**

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. If you don't have a web app yet, click **Add app** and select the web icon (`</>`)
4. Register your app with a nickname (e.g., "Dearly Web App")
5. Copy the Firebase configuration object

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Configure Environment Variables

1. Create a `.env` file in the `letter-client` directory (if it doesn't exist)
2. Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important:** 
- The `VITE_` prefix is required for Vite to expose these variables to your app
- Never commit your `.env` file to version control
- Make sure `.env` is in your `.gitignore`

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   cd letter-client
   npm run dev
   ```

2. Navigate to your app with `?mode=master` parameter:
   ```
   http://localhost:5173?mode=master
   ```

3. You should see the Dearly sign-in page
4. Try signing up with email/password or Google sign-in

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure your `.env` file is in the `letter-client` directory
- Verify all environment variables start with `VITE_`
- Restart your development server after creating/updating `.env`

### "Firebase: Error (auth/unauthorized-domain)"
- Go to Firebase Console > Authentication > Settings
- Add your domain to **Authorized domains**
- For local development, `localhost` should already be authorized

### Google Sign-In not working
- Make sure Google sign-in is enabled in Firebase Console
- Check that you've selected a support email
- Verify your OAuth consent screen is configured (if required)

## Security Notes

- The Firebase client SDK configuration is safe to expose in frontend code
- The API key is restricted by domain and authentication rules
- Never expose your Firebase Admin SDK credentials (server-side) in the client

## Next Steps

Once authentication is working:
- Users can sign in and access the master letter crafting interface
- You can extend the app to save letters to user accounts
- Add user profiles and letter management features


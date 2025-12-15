# 🔧 Fix: Domain Not Authorized for Google Sign-In

## Problem
Error: "domain not authorized for google sign in" when trying to sign in with Google on `https://dearly-tau.vercel.app`

## Solution
Add your Vercel domain to Firebase's authorized domains list.

---

## Steps to Fix

### 1. Go to Firebase Console

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **project-love-cc343**

### 2. Navigate to Authentication Settings

1. Click **Authentication** in the left sidebar
2. Click the **Settings** tab (gear icon)
3. Scroll down to **Authorized domains**

### 3. Add Your Vercel Domain

Click **"Add domain"** and add:

```
dearly-tau.vercel.app
```

**Important**: 
- Don't include `https://` or trailing slashes
- Just the domain: `dearly-tau.vercel.app`

### 4. Verify Domains List

Your authorized domains should include:
- ✅ `localhost` (for local development)
- ✅ `dearly-tau.vercel.app` (your production domain)
- ✅ Any other domains you use

### 5. Save and Test

1. Click **Save** (if needed)
2. Wait a few seconds for changes to propagate
3. Try Google sign-in again on your site

---

## Additional Checks

### Verify Google Sign-In is Enabled

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Click on **Google**
3. Make sure it's **Enabled**
4. Verify **Support email** is set
5. Click **Save**

### Check OAuth Consent Screen (if required)

If you see OAuth consent screen errors:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Add your domain to **Authorized domains**:
   - `vercel.app`
   - `dearly-tau.vercel.app`

---

## Common Issues

### Issue: Still getting "domain not authorized"

**Solutions:**
1. Clear browser cache and cookies
2. Wait 5-10 minutes for Firebase to propagate changes
3. Try in incognito/private window
4. Verify domain is exactly `dearly-tau.vercel.app` (no typos)

### Issue: Works locally but not on Vercel

**Solution:**
- Make sure you added the Vercel domain, not just `localhost`
- Check that `VITE_FIREBASE_AUTH_DOMAIN` in frontend matches your Firebase project

### Issue: Multiple domains

If you have multiple domains (e.g., `www.dearly-tau.vercel.app`), add all of them:
- `dearly-tau.vercel.app`
- `www.dearly-tau.vercel.app` (if you use it)

---

## Quick Checklist

- [ ] Added `dearly-tau.vercel.app` to Firebase Authorized domains
- [ ] Google sign-in is enabled in Firebase
- [ ] Support email is set in Firebase
- [ ] Waited a few minutes for changes to propagate
- [ ] Cleared browser cache
- [ ] Tested in incognito window

---

## Verification

After adding the domain:

1. Go to your site: https://dearly-tau.vercel.app/signin
2. Click "Sign in with Google"
3. Should redirect to Google sign-in (not show domain error)
4. After signing in, should redirect back to your app

---

**Status**: Ready to fix - just add domain to Firebase


# 🔗 Production URLs Configuration

## Your Deployed URLs

### Frontend
- **Main URL**: https://dearly-tau.vercel.app/
- **Sign In**: https://dearly-tau.vercel.app/signin

### Backend
- **Backend URL**: `https://your-backend.vercel.app` (replace with your actual backend URL)

---

## 🔧 Frontend Environment Variables (Vercel)

In your **frontend Vercel project** (`dearly-tau`), go to **Settings → Environment Variables** and set:

```bash
# Backend API URL (REQUIRED)
VITE_BACKEND_URL=https://your-backend.vercel.app

# Firebase Configuration (REQUIRED)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

**Important**: Replace `https://your-backend.vercel.app` with your actual backend URL after deploying the backend.

---

## 🔧 Backend Environment Variables (Vercel)

In your **backend Vercel project**, go to **Settings → Environment Variables** and set:

```bash
# CORS Configuration (REQUIRED - Use your frontend URL)
ALLOWED_ORIGINS=https://dearly-tau.vercel.app
CLIENT_URL=https://dearly-tau.vercel.app

# Firebase Configuration (REQUIRED)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Email Configuration (REQUIRED)
EMAIL_USER=app.dearly@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM_NAME=Dearly 💌

# Environment
NODE_ENV=production

# Cron Job Security (Optional but recommended)
CRON_SECRET=your-random-secret-string
```

**Critical**: 
- `ALLOWED_ORIGINS` must include `https://dearly-tau.vercel.app` (no trailing slash)
- `CLIENT_URL` must be `https://dearly-tau.vercel.app`

---

## ✅ Quick Setup Checklist

### Frontend (dearly-tau.vercel.app)
- [ ] Set `VITE_BACKEND_URL` to your backend URL
- [ ] Set all `VITE_FIREBASE_*` variables
- [ ] Redeploy after setting variables

### Backend
- [ ] Deploy backend to Vercel
- [ ] Set `ALLOWED_ORIGINS=https://dearly-tau.vercel.app`
- [ ] Set `CLIENT_URL=https://dearly-tau.vercel.app`
- [ ] Set all Firebase credentials
- [ ] Set email credentials
- [ ] Redeploy after setting variables

---

## 🧪 Testing

After setting all variables and redeploying:

### 1. Test Frontend
Visit: https://dearly-tau.vercel.app/signin

### 2. Test Backend Connection
Open browser console on your frontend and check for:
- ✅ No CORS errors
- ✅ API calls succeed
- ✅ Firebase authentication works

### 3. Test API Endpoint
```bash
curl https://your-backend.vercel.app/api/auth/check-verification/test
```

---

## 🐛 Troubleshooting

### CORS Errors
**Symptom**: `Access to fetch at '...' from origin 'https://dearly-tau.vercel.app' has been blocked by CORS policy`

**Solution**:
1. Check `ALLOWED_ORIGINS` includes `https://dearly-tau.vercel.app`
2. No trailing slash in `ALLOWED_ORIGINS`
3. Redeploy backend after updating

### API Connection Errors
**Symptom**: `Failed to fetch` or network errors

**Solution**:
1. Verify `VITE_BACKEND_URL` is set correctly in frontend
2. Check backend is deployed and accessible
3. Check browser console for specific error

### Firebase Errors
**Symptom**: Firebase initialization errors

**Solution**:
1. Verify all `VITE_FIREBASE_*` variables are set
2. Check Firebase project settings
3. Verify authorized domains in Firebase Console

---

## 📝 Notes

- **No trailing slashes**: Use `https://dearly-tau.vercel.app` not `https://dearly-tau.vercel.app/`
- **HTTPS required**: Both frontend and backend must use HTTPS in production
- **Redeploy after changes**: Always redeploy after updating environment variables

---

**Last Updated**: Current
**Status**: Ready for production configuration



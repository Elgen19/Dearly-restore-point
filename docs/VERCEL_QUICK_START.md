# ⚡ Vercel Quick Start

## 🚀 Deploy in 5 Minutes

### Backend (letter-server)

1. **Deploy to Vercel**
   ```bash
   cd letter-server
   vercel
   ```

2. **Set Environment Variables** (in Vercel Dashboard → Settings → Environment Variables)
   ```
   FIREBASE_PROJECT_ID=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_DATABASE_URL=...
   FIREBASE_STORAGE_BUCKET=...
   CLIENT_URL=https://your-frontend.vercel.app
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   EMAIL_USER=app.dearly@gmail.com
   EMAIL_PASS=...
   NODE_ENV=production
   ```

3. **Get Backend URL**: `https://your-backend.vercel.app`

### Frontend (letter-client)

1. **Deploy to Vercel**
   ```bash
   cd letter-client
   vercel
   ```

2. **Set Environment Variables**
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_DATABASE_URL=...
   VITE_BACKEND_URL=https://your-backend.vercel.app
   ```

3. **Get Frontend URL**: `https://your-frontend.vercel.app`

4. **Update Backend CORS**: Add frontend URL to `ALLOWED_ORIGINS` in backend env vars

### Cron Job Setup

1. Go to **Backend Project → Settings → Cron Jobs**
2. Add cron job:
   - Path: `/api/cron/email-scheduler`
   - Schedule: `*/1 * * * *` (every minute)
3. **Note**: Requires Vercel Pro plan, or use external cron service

---

## ✅ Done!

Your app is now live at:
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.vercel.app`

---

For detailed instructions, see `VERCEL_DEPLOYMENT_GUIDE.md`


# 🚀 Vercel Deployment Guide

This guide will help you deploy both the frontend and backend to Vercel.

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **Vercel CLI** (optional): `npm i -g vercel`

---

## 🔧 Backend Deployment (letter-server)

### Step 1: Prepare Backend for Vercel

The backend is already configured for Vercel with:
- ✅ `vercel.json` configuration
- ✅ Serverless function entry point (`api/index.js`)
- ✅ Cron job endpoint (`api/cron/email-scheduler.js`)

### Step 2: Deploy Backend

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure the project:
   - **Root Directory**: `letter-server`
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

5. Click **"Deploy"**

#### Option B: Deploy via CLI

```bash
cd letter-server
vercel
```

Follow the prompts to link your project.

### Step 3: Set Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

#### Required Variables:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Production URLs
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.vercel.app
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://www.your-frontend-domain.vercel.app

# Email Configuration
EMAIL_USER=app.dearly@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM_NAME=Dearly 💌

# Cron Job Security (generate a random string)
CRON_SECRET=your-random-secret-string-here
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`: Copy the entire key including `\n` characters, or use the format shown above
- For `ALLOWED_ORIGINS`: Use your actual frontend domain(s), comma-separated
- For `CLIENT_URL`: Use your actual frontend domain
- Generate `CRON_SECRET`: Use a long random string (e.g., `openssl rand -hex 32`)

### Step 4: Configure Vercel Cron Job

1. Go to **Settings → Cron Jobs** in your Vercel dashboard
2. Add a new cron job:
   - **Path**: `/api/cron/email-scheduler`
   - **Schedule**: `*/1 * * * *` (every minute)
   - **Timezone**: Your preferred timezone

**Note**: Vercel Cron Jobs require a Pro plan. For Hobby plan, you can:
- Use an external cron service (e.g., cron-job.org) to ping the endpoint
- Or use Vercel's free tier with manual triggers

### Step 5: Get Your Backend URL

After deployment, note your backend URL:
- Example: `https://your-backend.vercel.app`
- This will be used in the frontend configuration

---

## 🎨 Frontend Deployment (letter-client)

### Step 1: Update Frontend Configuration

Update `letter-client/src/config/firebase.js` to use environment variables (already done).

### Step 2: Create Vercel Configuration

Create `letter-client/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### Step 3: Set Environment Variables

In your frontend Vercel project, go to **Settings → Environment Variables**:

```bash
# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Backend API URL (used throughout the frontend)
VITE_BACKEND_URL=https://your-backend.vercel.app
```

### Step 4: Deploy Frontend

#### Option A: Deploy via Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure:
   - **Root Directory**: `letter-client`
   - **Framework Preset**: Vite
   - Build settings should auto-detect

5. Click **"Deploy"**

#### Option B: Deploy via CLI

```bash
cd letter-client
vercel
```

### Step 5: Update Backend CORS

After deploying the frontend, update the backend's `ALLOWED_ORIGINS` environment variable to include your frontend URL:

```bash
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app
```

Redeploy the backend after updating.

---

## 🔄 Updating Deployments

### Backend Updates

```bash
cd letter-server
vercel --prod
```

### Frontend Updates

```bash
cd letter-client
vercel --prod
```

Or push to your Git repository - Vercel will auto-deploy.

---

## 🧪 Testing After Deployment

### 1. Test Backend

```bash
# Test root endpoint
curl https://your-backend.vercel.app/api/

# Test health check
curl https://your-backend.vercel.app/api/auth/check-verification/test-user-id
```

### 2. Test Frontend

1. Visit your frontend URL
2. Test authentication
3. Test API calls
4. Check browser console for errors

### 3. Test Cron Job

```bash
# Manually trigger cron job (replace CRON_SECRET)
curl -X GET https://your-backend.vercel.app/api/cron/email-scheduler \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: "Module not found" errors
- **Solution**: Ensure all dependencies are in `package.json` and run `npm install` locally first

**Issue**: Environment variables not working
- **Solution**: 
  - Check variable names match exactly (case-sensitive)
  - Redeploy after adding variables
  - Check for typos in variable values

**Issue**: CORS errors
- **Solution**: 
  - Verify `ALLOWED_ORIGINS` includes your frontend URL
  - Check for trailing slashes
  - Ensure `CLIENT_URL` is set correctly

**Issue**: Cron job not running
- **Solution**:
  - Verify cron job is configured in Vercel dashboard
  - Check `CRON_SECRET` is set correctly
  - Verify endpoint is accessible

### Frontend Issues

**Issue**: Environment variables not loading
- **Solution**: 
  - Ensure variables start with `VITE_`
  - Redeploy after adding variables
  - Check browser console for undefined values

**Issue**: API calls failing
- **Solution**:
  - Verify `VITE_API_URL` is set correctly
  - Check backend CORS configuration
  - Check browser network tab for error details

---

## 📊 Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor:
   - Function execution times
   - Error rates
   - API response times

### Logs

View logs in Vercel dashboard:
- **Deployments → [Deployment] → Functions** tab
- Real-time function logs
- Error tracking

---

## 🔒 Security Checklist

- [ ] All environment variables set in Vercel
- [ ] `CRON_SECRET` is a strong random string
- [ ] `ALLOWED_ORIGINS` only includes your domains
- [ ] Firebase credentials are correct
- [ ] Email credentials are correct
- [ ] No sensitive data in code
- [ ] `.env` files are in `.gitignore`

---

## 📝 Quick Reference

### Backend URL
```
https://your-backend.vercel.app
```

### Frontend URL
```
https://your-frontend.vercel.app
```

### API Endpoints
```
https://your-backend.vercel.app/api/*
```

### Cron Job
```
https://your-backend.vercel.app/api/cron/email-scheduler
```

---

## 🆘 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check function logs in dashboard
3. Verify all environment variables
4. Test endpoints with curl/Postman
5. Check Firebase console for errors

---

**Last Updated**: Before production launch
**Status**: Ready for Vercel deployment


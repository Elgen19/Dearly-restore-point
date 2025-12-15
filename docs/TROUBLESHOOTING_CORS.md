# CORS Troubleshooting Guide

## Current Issues

1. **CORS Preflight Redirect Error**: "Redirect is not allowed for a preflight request"
2. **Data not saving to database**: Requests blocked by CORS never reach the backend

## Root Cause

The error "Redirect is not allowed for a preflight request" means:
- Browser sends OPTIONS preflight request
- Vercel or Express redirects the request (e.g., trailing slash redirect)
- Browser blocks the redirect because preflight requests cannot be redirected

## Solutions Implemented

### 1. Manual CORS Middleware (Before CORS library)
- Added middleware that handles OPTIONS requests FIRST
- Sets CORS headers on ALL responses
- Returns immediately for OPTIONS requests (no redirect possible)

### 2. Enhanced Logging
- Logs all OPTIONS requests
- Logs CORS decisions
- Logs request/response details

### 3. Vercel Configuration
- Ensured vercel.js exports Express app correctly
- Routes configured to pass all requests to Express

## Required Environment Variables

### Backend (Vercel)
```
ALLOWED_ORIGINS=https://dearly-tau.vercel.app
NODE_ENV=production
```

### Frontend (Vercel)
```
VITE_BACKEND_URL=https://dearly-server.vercel.app
```
**CRITICAL**: No trailing slash!

## Testing Steps

1. **Check Vercel Backend Logs**:
   - Look for `🔍 OPTIONS preflight request` logs
   - Should see `✅ OPTIONS preflight allowed`
   - If you see `❌ OPTIONS preflight blocked`, check `ALLOWED_ORIGINS`

2. **Check Browser Console**:
   - Look for CORS errors
   - Check Network tab for OPTIONS requests
   - Verify request URL has no double slashes

3. **Check Database**:
   - After successful sign-in, check Firebase Realtime Database
   - Path: `users/{userId}`
   - Should see user data saved

## If Still Not Working

1. **Verify Environment Variables**:
   ```bash
   # In Vercel Dashboard, check:
   - ALLOWED_ORIGINS = https://dearly-tau.vercel.app (exact match, no trailing slash)
   - VITE_BACKEND_URL = https://dearly-server.vercel.app (no trailing slash)
   ```

2. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Backend Project → Logs
   - Look for OPTIONS request logs
   - Check if requests are reaching the backend

3. **Test with curl**:
   ```bash
   curl -X OPTIONS https://dearly-server.vercel.app/api/auth/save-google-user \
     -H "Origin: https://dearly-tau.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -v
   ```
   Should return 200 with CORS headers

4. **Check for Redirects**:
   - Vercel might be redirecting `/api/...` to `/api/.../` (trailing slash)
   - Check Network tab in browser - look for 301/302 redirects
   - If redirects exist, they need to be handled before OPTIONS

## Next Steps if Issue Persists

1. Check if Vercel is doing automatic redirects
2. Consider using Vercel's built-in CORS handling
3. Check if there's a proxy or CDN in front of Vercel
4. Verify the exact URL being called (check for double slashes)


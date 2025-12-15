# Running Backend on Localhost

## Quick Start

### Step 1: Install Dependencies

```bash
cd letter-server
npm install
```

### Step 2: Set Up Environment Variables

Create or update `.env` file in `letter-server/` directory with:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Firebase Configuration (Required)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Email Configuration (Optional - for email features)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=Dearly 💌

# Client URL (for CORS and email links)
CLIENT_URL=http://localhost:5173

# CORS Origins (Optional - defaults to localhost in development)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Step 3: Run the Server

**Option A: Regular Start**
```bash
npm start
```

**Option B: Development Mode (Auto-restart on changes)**
```bash
npm run dev
```

### Step 4: Verify Server is Running

You should see:
```
✅ Server running on http://localhost:5000
```

### Step 5: Test the Server

**Test Root Endpoint:**
```bash
curl http://localhost:5000/
```

**Test Firebase Connection:**
```bash
curl http://localhost:5000/api/auth/test-firebase
```

**Test Health Check:**
Visit in browser: `http://localhost:5000/api/auth/test-firebase`

## Common Issues

### Issue: "Firebase database not initialized"

**Solution:** Check your `.env` file has all Firebase variables:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY` (with `\n` for newlines)
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_DATABASE_URL`

### Issue: "Port already in use"

**Solution:** Change PORT in `.env`:
```env
PORT=5001
```

Or kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### Issue: "Module not found"

**Solution:** Install dependencies:
```bash
npm install
```

### Issue: CORS errors from frontend

**Solution:** Make sure `CLIENT_URL` in `.env` matches your frontend URL:
```env
CLIENT_URL=http://localhost:5173
```

## Testing Endpoints

### Available Test Endpoints

1. **Firebase Test:**
   ```
   GET http://localhost:5000/api/auth/test-firebase
   ```

2. **Health Check:**
   ```
   GET http://localhost:5000/
   ```

3. **Save Google User:**
   ```
   POST http://localhost:5000/api/auth/save-google-user
   Content-Type: application/json
   
   {
     "uid": "user-id",
     "email": "user@example.com",
     "displayName": "User Name"
   }
   ```

4. **Get Receiver Data:**
   ```
   GET http://localhost:5000/api/receiver-data/:userId
   ```

5. **Save Receiver Data:**
   ```
   POST http://localhost:5000/api/receiver-data/:userId
   Content-Type: application/json
   
   {
     "name": "Receiver Name",
     "email": "receiver@example.com"
   }
   ```

## Connecting Frontend to Localhost Backend

In your frontend `.env` file, set:
```env
VITE_BACKEND_URL=http://localhost:5000
```

## Next Steps

1. ✅ Server running on `http://localhost:5000`
2. ✅ Test Firebase connection
3. ✅ Test API endpoints
4. ✅ Connect frontend to localhost backend
5. ✅ Test full flow (sign in → save data → etc.)

## Troubleshooting

### Check Server Logs

The server will show:
- ✅ Firebase initialization status
- ✅ Registered routes
- ✅ CORS configuration
- ❌ Any errors

### Verify Environment Variables

The server logs will show:
```
📋 Firebase Config:
  projectId: ✅ Set
  privateKey: ✅ Set
  clientEmail: ✅ Set
  databaseURL: ✅ https://...
```

If any show "❌ Missing", check your `.env` file.


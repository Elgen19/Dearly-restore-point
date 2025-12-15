# Postman Testing Guide for Date Invitations API

## Prerequisites
1. Make sure your server is running:
   ```bash
   cd letter-server
   npm run dev
   ```
2. Server should be running on `http://localhost:5000` (or your configured PORT)

## Base URL
```
http://localhost:5000/api/date-invitations
```

---

## 1. GET All Invitations

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/date-invitations`
- **Headers:** None required

**Expected Response (Success - 200):**
```json
[
  {
    "id": "abc123",
    "date": "2024-12-25",
    "time": "19:00",
    "location": "Romantic Restaurant",
    "message": "I'd love to spend Christmas with you! 💕",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Expected Response (Empty - 200):**
```json
[]
```

**Expected Response (Firebase Not Configured - 503):**
```json
{
  "message": "Firebase is not configured. Please set up Firebase credentials."
}
```

---

## 2. GET Specific Invitation

**Request:**
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/date-invitations/{invitationId}`
- **Example:** `http://localhost:5000/api/date-invitations/abc123`
- **Headers:** None required

**Expected Response (Success - 200):**
```json
{
  "id": "abc123",
  "date": "2024-12-25",
  "time": "19:00",
  "location": "Romantic Restaurant",
  "message": "I'd love to spend Christmas with you! 💕",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Expected Response (Not Found - 404):**
```json
{
  "message": "Invitation not found"
}
```

---

## 3. POST Create New Invitation

**Request:**
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/date-invitations`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "date": "2024-12-25",
    "time": "19:00",
    "location": "Romantic Restaurant",
    "message": "I'd love to spend Christmas with you! 💕"
  }
  ```

**Expected Response (Success - 201):**
```json
{
  "message": "Invitation created successfully",
  "invitation": {
    "id": "new-auto-generated-id",
    "date": "2024-12-25",
    "time": "19:00",
    "location": "Romantic Restaurant",
    "message": "I'd love to spend Christmas with you! 💕",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Expected Response (Missing Fields - 400):**
```json
{
  "message": "Date, time, and location are required"
}
```

**Test Cases:**
- ✅ Valid request with all fields
- ✅ Valid request without message (optional)
- ❌ Missing date
- ❌ Missing time
- ❌ Missing location

---

## 4. PUT Update RSVP (Accept)

**Request:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/date-invitations/{invitationId}/rsvp`
- **Example:** `http://localhost:5000/api/date-invitations/abc123/rsvp`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "status": "accepted",
    "rsvpMessage": "I can't wait! See you there! 💕"
  }
  ```

**Expected Response (Success - 200):**
```json
{
  "message": "RSVP updated successfully",
  "invitation": {
    "id": "abc123",
    "date": "2024-12-25",
    "time": "19:00",
    "location": "Romantic Restaurant",
    "message": "I'd love to spend Christmas with you! 💕",
    "status": "accepted",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "rsvpMessage": "I can't wait! See you there! 💕",
    "rsvpAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

## 5. PUT Update RSVP (Decline)

**Request:**
- **Method:** `PUT`
- **URL:** `http://localhost:5000/api/date-invitations/{invitationId}/rsvp`
- **Example:** `http://localhost:5000/api/date-invitations/abc123/rsvp`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "status": "declined",
    "rsvpMessage": "Sorry, I have other plans that day."
  }
  ```

**Expected Response (Success - 200):**
```json
{
  "message": "RSVP updated successfully",
  "invitation": {
    "id": "abc123",
    "date": "2024-12-25",
    "time": "19:00",
    "location": "Romantic Restaurant",
    "message": "I'd love to spend Christmas with you! 💕",
    "status": "declined",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "rsvpMessage": "Sorry, I have other plans that day.",
    "rsvpAt": "2024-01-15T10:35:00.000Z"
  }
}
```

**Expected Response (Already Responded - 400):**
```json
{
  "message": "Invitation has already been responded to"
}
```

**Expected Response (Invalid Status - 400):**
```json
{
  "message": "Invalid status. Must be 'accepted' or 'declined'"
}
```

**Expected Response (Not Found - 404):**
```json
{
  "message": "Invitation not found"
}
```

**Test Cases:**
- ✅ Accept with message
- ✅ Accept without message (rsvpMessage optional)
- ✅ Decline with message
- ✅ Decline without message
- ❌ Invalid status (e.g., "maybe")
- ❌ Already responded invitation
- ❌ Non-existent invitation ID

---

## Complete Testing Workflow

### Step 1: Create Test Invitation
```
POST http://localhost:5000/api/date-invitations
Body: {
  "date": "2024-12-25",
  "time": "19:00",
  "location": "Romantic Restaurant",
  "message": "Test invitation"
}
```
**Save the `id` from the response!**

### Step 2: Get All Invitations
```
GET http://localhost:5000/api/date-invitations
```
**Verify your invitation appears in the list**

### Step 3: Get Specific Invitation
```
GET http://localhost:5000/api/date-invitations/{id-from-step-1}
```

### Step 4: RSVP to Invitation
```
PUT http://localhost:5000/api/date-invitations/{id-from-step-1}/rsvp
Body: {
  "status": "accepted",
  "rsvpMessage": "Looking forward to it!"
}
```

### Step 5: Verify Status Changed
```
GET http://localhost:5000/api/date-invitations/{id-from-step-1}
```
**Status should now be "accepted"**

### Step 6: Try to RSVP Again (Should Fail)
```
PUT http://localhost:5000/api/date-invitations/{id-from-step-1}/rsvp
Body: {
  "status": "declined"
}
```
**Should return 400 error: "Invitation has already been responded to"**

---

## Postman Collection Setup

### Create a Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it "Date Invitations API"

### Add Environment Variables (Optional)
1. Click "Environments" → "Create Environment"
2. Add variable:
   - **Variable:** `base_url`
   - **Initial Value:** `http://localhost:5000`
3. Use in requests: `{{base_url}}/api/date-invitations`

### Save Requests
1. Create each request above
2. Save them to your collection
3. Use the collection runner to test all endpoints

---

## Common Issues

### "Firebase is not configured" (503)
- **Solution:** Add Firebase credentials to `.env` file
- See `FIREBASE_SETUP_INSTRUCTIONS.md`

### "Cannot GET /api/date-invitations"
- **Solution:** Make sure server is running on correct port
- Check `PORT` in `.env` or default `5000`

### "Network Error" or Connection Refused
- **Solution:** 
  - Verify server is running: `npm run dev`
  - Check if port is correct
  - Try `http://127.0.0.1:5000` instead of `localhost`

### CORS Errors
- **Solution:** CORS is already enabled in the server
- If issues persist, check server logs

---

## Quick Test Script

You can also test using curl commands:

```bash
# Get all invitations
curl http://localhost:5000/api/date-invitations

# Create invitation
curl -X POST http://localhost:5000/api/date-invitations \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-12-25","time":"19:00","location":"Test","message":"Test"}'

# RSVP (replace {id} with actual ID)
curl -X PUT http://localhost:5000/api/date-invitations/{id}/rsvp \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted","rsvpMessage":"Great!"}'
```


# Postman Testing Guide for PDF Generation

## ⚠️ Important Note

**PDF generation happens on the CLIENT-SIDE (browser)**, not server-side. This means you **cannot fully test PDF generation in Postman** because:

1. PDF generation uses `pdf-lib` which runs in the browser
2. Template loading requires browser file system access
3. PDF download triggers browser download dialog

## ✅ Alternative Testing Methods

### Option 1: Test Page (Recommended)

I've created a test page for you:

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:5173/test-pdf.html
   ```

3. **Fill in the form:**
   - Enter letter content
   - Enter recipient name
   - Enter sender name

4. **Click "Generate PDF"**
   - PDF will download automatically
   - Check browser console (F12) for any errors

### Option 2: Browser Console Testing

1. **Open your app in browser**
2. **Open browser console (F12)**
3. **Import and test:**
   ```javascript
   import { generateLetterPDF } from './src/utils/pdfGenerator.js';
   
   // Test with sample content
   await generateLetterPDF(
     "This is a test letter to verify the template works correctly.",
     "Faith",
     "Elgen"
   );
   ```

### Option 3: Backend Test Endpoint (Parameter Validation Only)

The backend endpoint `/api/pdf-test/generate` can validate parameters but **cannot generate PDFs** (since it's client-side).

**Postman Request:**
- **Method:** POST
- **URL:** `http://localhost:5000/api/pdf-test/generate`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "mainBody": "This is test letter content...",
    "recipientName": "Faith",
    "senderName": "Elgen",
    "useTemplate": true
  }
  ```
- **Response:** Validation confirmation (not actual PDF)

## 📝 Adjusting Text Placement

To adjust where text appears in your template:

### Step 1: Open the Template Generator File

Open: `letter-client/src/utils/pdfGeneratorTemplate.js`

### Step 2: Find the Coordinate Values (around line 45-50)

Look for these values:
```javascript
const margin = 50;           // Left/right margin (points)
const headerHeight = 80;     // Space at top (points)
const footerHeight = 80;     // Space at bottom (points)
```

### Step 3: Adjust Values

**To move text LEFT:**
- Decrease `margin` (e.g., 50 → 30)

**To move text RIGHT:**
- Increase `margin` (e.g., 50 → 70)

**To move text UP (higher on page):**
- Decrease `headerHeight` (e.g., 80 → 50)

**To move text DOWN (lower on page):**
- Increase `headerHeight` (e.g., 80 → 120)

**To adjust signature position:**
- Find `signatureY = currentY - 20` (around line 150)
- Change the `-20` value:
  - Larger number (e.g., -30) → Signature higher up
  - Smaller number (e.g., -10) → Signature lower down

**To adjust signature horizontal position:**
- Find `x: width - margin - 150` (around line 152)
- Change the `150` value:
  - Smaller number (e.g., 100) → More to the right
  - Larger number (e.g., 200) → More to the left

### Step 4: Test

1. Generate a test PDF
2. Check where text appears
3. Adjust values (try ±10 points at a time)
4. Test again
5. Repeat until perfect

## 📐 Coordinate Reference

**PDF coordinates:**
- Origin (0,0) is at **BOTTOM-LEFT** corner
- X increases to the **right**
- Y increases **upward**
- Units are in **points** (72 points = 1 inch)

**For A4 page:**
- Width: 595 points
- Height: 842 points
- Top-left: (0, 842)
- Bottom-left: (0, 0)
- Center: (297.5, 421)

## 🔧 Quick Adjustments

### Common Values:

**Wide margins (30mm):**
```javascript
const margin = 85;  // 30mm ≈ 85 points
```

**Narrow margins (15mm):**
```javascript
const margin = 43;  // 15mm ≈ 43 points
```

**Large header:**
```javascript
const headerHeight = 150;
```

**Large footer:**
```javascript
const footerHeight = 120;
```

## 📋 Summary

- ✅ **Use test page:** `http://localhost:5173/test-pdf.html`
- ✅ **Adjust coordinates** in `pdfGeneratorTemplate.js`
- ✅ **Test and iterate** until perfect
- ❌ **Postman** can only validate parameters, not generate PDFs

## 🆘 Need Help?

Share your template's:
- Border width from edges (in mm)
- Header height (in mm)
- Signature area position

I can calculate the exact coordinates for you!


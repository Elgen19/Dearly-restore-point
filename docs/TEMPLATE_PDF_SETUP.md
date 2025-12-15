# PDF Template Setup Guide

This guide explains how to use your existing PDF template to generate letters.

## Overview

`pdf-lib` can load an existing PDF template and overlay text on top of it. However, **it does not automatically detect borders or design elements** - you need to manually specify coordinates for text placement based on your template's layout.

## Setup Steps

### 1. Place Your Template PDF

✅ **Template is already set up!**
- Your template is located at: `letter-client/public/template.pdf`
- It was copied from `src/templates/template.pdf`
- The template is accessible at `/template.pdf`

### 2. Enable Template Mode

✅ **Template mode is already enabled!**

In `letter-client/src/utils/pdfGenerator.js`, template mode is set:

```javascript
const USE_TEMPLATE = true; // Template mode enabled
const TEMPLATE_PATH = '/template.pdf'; // Template path
```

To disable template mode and use programmatic generation, change `USE_TEMPLATE` to `false`.

### 3. Measure Your Template

**Use the built-in measurement helper!**

In your browser console or component, run:

```javascript
import { measureTemplate } from './utils/measureTemplate';
measureTemplate('/template.pdf').then(result => console.log(result));
```

This will log:
- Template dimensions (width, height in points, mm, inches)
- Suggested coordinates for text placement
- Reference points for positioning

**PDF coordinates work like this:**

- **Origin (0,0) is at the BOTTOM-LEFT corner**
- X increases to the right
- Y increases upward
- Units are in **points** (72 points = 1 inch = 25.4mm)

For A4 page:
- Width: 595 points (210mm)
- Height: 842 points (297mm)

### 4. Adjust Text Coordinates

In `letter-client/src/utils/pdfGeneratorTemplate.js`, you'll need to adjust these coordinates:

```javascript
// Example coordinates - adjust based on your template
const margin = 30; // Left/right margin from edge
const startY = height - margin - 50; // Top of content area
const maxY = margin + 50; // Bottom of content area (leave space for signature)
```

### 5. Common Template Layout Coordinates

Here are common coordinates for letter templates:

**For content starting at top of page (below header):**
```javascript
const startY = height - 100; // 100 points from top
```

**For content starting in middle section:**
```javascript
const startY = height - 150; // 150 points from top
```

**For content with decorative borders:**
- If borders are 20mm from edges:
  - `margin = 57` (20mm = ~57 points)
  - `startY = height - 57 - headerHeight`

**For signature area:**
```javascript
const signatureY = 80; // 80 points from bottom
```

## Finding Coordinates in Your Template

### Method 1: Use the Measure Function

Add this to your code temporarily:

```javascript
import { measureTemplate } from './utils/pdfGeneratorTemplate';

// In your component or dev console
measureTemplate('/letter-template.pdf');
// This will log the template dimensions
```

### Method 2: Visual Inspection

1. Open your template PDF
2. Measure distances using PDF viewer rulers or screenshot with a ruler tool
3. Convert measurements to points:
   - mm to points: `mm * 2.83465`
   - inches to points: `inches * 72`

### Method 3: Trial and Error

1. Start with estimated coordinates
2. Generate a test PDF
3. Adjust coordinates until text aligns correctly

## Template Requirements

Your template PDF should:

- ✅ Be a valid PDF file
- ✅ Have at least one page (first page is used as template for all pages)
- ✅ Be accessible from the public folder
- ✅ Have enough space for content (adjustable margins)

## Text Wrapping

The template generator automatically:
- ✅ Wraps text to fit within margins
- ✅ Handles long paragraphs
- ✅ Adds new pages when content exceeds page height
- ✅ Clones template design to new pages

## Example: Adjusting for Your Template

If your template has:
- Header taking 100 points from top
- Borders 30 points from each edge
- Signature area 80 points from bottom

Your coordinates would be:

```javascript
const margin = 30; // Left/right margin matching borders
const headerHeight = 100; // Space for header
const startY = height - margin - headerHeight - 20; // Content start
const maxY = margin + 80; // Bottom margin (signature space)
```

## Testing

1. Generate a test PDF with short text
2. Check if recipient name, content, and signature are in correct positions
3. Adjust coordinates as needed
4. Test with longer text to verify page breaks work correctly

## Troubleshooting

**Text appears in wrong location:**
- Adjust `startY` (vertical position)
- Adjust `margin` (horizontal position)

**Text overlaps borders:**
- Increase `margin` values
- Decrease `contentWidth`

**Text cut off at bottom:**
- Increase `maxY` value
- Check `currentY` decrement in loop

**Template not loading:**
- Verify file is in `public/` folder
- Check `TEMPLATE_PATH` matches filename
- Verify path is accessible (try opening `/letter-template.pdf` in browser)

## Need Help?

If you share your template PDF structure (border widths, header height, etc.), I can help calculate the exact coordinates needed.


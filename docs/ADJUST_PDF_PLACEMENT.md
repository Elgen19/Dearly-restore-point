# How to Adjust PDF Text Placement

This guide explains how to adjust text placement in your PDF template.

## Quick Start: Key Values to Adjust

In `letter-client/src/utils/pdfGeneratorTemplate.js`, look for these values around **line 45-50**:

```javascript
const margin = 50;           // Left/right margin from edges (points)
const headerHeight = 80;     // Space at top for header/decorations (points)
const footerHeight = 80;     // Space at bottom for signature (points)
```

## Coordinate System

PDF coordinates work differently than web coordinates:
- **Origin (0,0) is at BOTTOM-LEFT** (not top-left)
- **X increases to the right**
- **Y increases upward**
- **Units are in points** (72 points = 1 inch = 25.4mm)

### Example for A4 page:
- Width: 595 points
- Height: 842 points
- Top-left corner: (0, 842)
- Bottom-left corner: (0, 0)
- Center: (297.5, 421)

## Common Adjustments

### 1. Move Text Left/Right (Horizontal)

**Adjust `margin` value:**
```javascript
const margin = 50;  // Increase to move text RIGHT (away from left edge)
                    // Decrease to move text LEFT (closer to left edge)
```

**Example:**
- `margin = 30` → Text closer to left edge
- `margin = 70` → Text farther from left edge

### 2. Move Text Up/Down (Vertical - Header)

**Adjust `headerHeight` and `startY`:**
```javascript
const headerHeight = 80;     // Space reserved at top
const startY = height - margin - headerHeight - 10;  // Where content starts
```

**To move content DOWN (lower on page):**
- Increase `headerHeight` (e.g., 80 → 120)

**To move content UP (higher on page):**
- Decrease `headerHeight` (e.g., 80 → 50)

### 3. Adjust Bottom Space (Footer/Signature)

**Adjust `footerHeight` and `maxY`:**
```javascript
const footerHeight = 80;  // Space reserved at bottom
const maxY = margin + footerHeight;  // Bottom boundary
```

**To leave more space at bottom:**
- Increase `footerHeight` (e.g., 80 → 120)

**To use more space at bottom:**
- Decrease `footerHeight` (e.g., 80 → 50)

### 4. Adjust Signature Position

**Find this around line 150:**
```javascript
const signatureY = currentY - 20;  // Vertical position
x: width - margin - 150,  // Horizontal position (align right)
```

**To move signature:**
- `signatureY` value: Increase to move UP, decrease to move DOWN
- `width - margin - 150`: Change `150` to adjust horizontal position
  - Smaller number (e.g., 100) → More to the right
  - Larger number (e.g., 200) → More to the left

## Step-by-Step Adjustment Process

### Step 1: Measure Your Template

Use the measurement helper:
```javascript
import { measureTemplate } from './utils/measureTemplate';
measureTemplate('/template.pdf').then(result => console.log(result));
```

### Step 2: Identify Your Template's Layout

Answer these questions:
1. **How far from left edge is your content area?** (in mm or points)
2. **How far from top is your content area?** (header height)
3. **How far from bottom is your signature area?** (footer height)

### Step 3: Convert Measurements to Points

**Conversion formulas:**
- mm to points: `mm * 2.83465`
- inches to points: `inches * 72`

**Example:**
- 20mm margin = 20 * 2.83465 = **~57 points**
- 1 inch header = 1 * 72 = **72 points**

### Step 4: Update the Values

Replace the values in `pdfGeneratorTemplate.js`:

```javascript
// Before
const margin = 50;
const headerHeight = 80;
const footerHeight = 80;

// After (example for 20mm margins)
const margin = 57;  // 20mm * 2.83465
const headerHeight = 100;  // Your template's header height
const footerHeight = 90;   // Your template's footer height
```

### Step 5: Test and Fine-tune

1. Generate a test PDF
2. Check where text appears
3. Adjust values slightly (try ±10 points at a time)
4. Test again
5. Repeat until perfect

## Common Template Layouts

### Template with Wide Borders (e.g., 30mm)

```javascript
const margin = 85;  // 30mm * 2.83465 = ~85 points
const headerHeight = 100;
const footerHeight = 100;
```

### Template with Narrow Borders (e.g., 15mm)

```javascript
const margin = 43;  // 15mm * 2.83465 = ~43 points
const headerHeight = 60;
const footerHeight = 60;
```

### Template with Large Header/Footer

```javascript
const margin = 50;
const headerHeight = 150;  // Large decorative header
const footerHeight = 120;  // Large signature area
```

## Testing Your Changes

### Quick Test Function

Add this temporarily to test coordinates:

```javascript
// In pdfGeneratorTemplate.js, add this after loading template:
console.log('Template loaded:', {
  width,
  height,
  margin,
  startY,
  maxY,
  contentWidth: width - (margin * 2)
});
```

### Visual Testing

1. Generate PDF with test text
2. Open in PDF viewer with rulers enabled
3. Measure actual text position
4. Calculate difference from desired position
5. Adjust coordinates accordingly

## Troubleshooting

**Text overlaps borders:**
- Increase `margin` value

**Text too close to top:**
- Increase `headerHeight` or adjust `startY`

**Text cut off at bottom:**
- Increase `maxY` or decrease `footerHeight`

**Signature not visible:**
- Check `signatureY` is not too low (should be > 50)
- Verify there's enough space above `maxY`

**Text position looks wrong:**
- Remember PDF Y starts at bottom (not top)
- Higher Y = higher on page
- Lower Y = lower on page

## Need Help?

If you share:
- Border widths (in mm)
- Header height (in mm)
- Content area position

I can calculate the exact coordinates for you!


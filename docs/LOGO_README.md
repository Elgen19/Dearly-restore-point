# Dearly Logo Files

This directory contains multiple versions of the Dearly logo for different use cases.

## Available Logo Files

### 1. `dearly-logo.svg` (Standard Horizontal)
- **Size**: 200x60px
- **Use**: Main logo for headers, navigation bars
- **Features**: Gradient text with subtle heart accent

### 2. `dearly-logo-icon.svg` (Icon Only)
- **Size**: 60x60px
- **Use**: App icons, profile pictures, square spaces
- **Features**: "D" monogram with envelope accent

### 3. `dearly-logo-full.svg` (Full Logo with Tagline)
- **Size**: 300x80px
- **Use**: Landing pages, marketing materials
- **Features**: Envelope icon + "Dearly" text + tagline

### 4. `dearly-logo-stacked.svg` (Vertical/Stacked)
- **Size**: 120x120px
- **Use**: Mobile headers, centered layouts
- **Features**: Envelope icon above "Dearly" text

### 5. `dearly-logo-monochrome.svg` (Single Color)
- **Size**: 200x60px
- **Use**: Light backgrounds, print materials
- **Features**: Rose color (#f43f5e) for simplicity

### 6. `dearly-favicon.svg` (Favicon)
- **Size**: 32x32px
- **Use**: Browser tab icon
- **Features**: Simple "D" monogram

## Color Palette

- **Rose**: `#f43f5e` (rose-500)
- **Pink**: `#ec4899` (pink-500)
- **Purple**: `#a855f7` (purple-500)

## Usage in React

```jsx
// Standard logo
<img src="/dearly-logo.svg" alt="Dearly" className="h-12" />

// Icon
<img src="/dearly-logo-icon.svg" alt="Dearly" className="w-12 h-12" />

// As inline SVG (for styling control)
import DearlyLogo from '/dearly-logo.svg';
```

## Customization

All logos are SVG files and can be:
- Scaled to any size without quality loss
- Styled with CSS (fill, stroke, opacity)
- Edited in any vector graphics editor
- Converted to PNG/JPG if needed

## Background Compatibility

- **Gradient versions**: Work best on white/light backgrounds
- **Monochrome version**: Works on any background
- For dark backgrounds, consider inverting colors or using white version


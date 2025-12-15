// pdfGeneratorTemplate.js - Generate PDF using an existing template
// This version loads an existing PDF template and populates it with text
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generate PDF from template
 * @param {string} mainBody - The letter content to add
 * @param {string} recipientName - Recipient's name
 * @param {string} templatePath - Path to the PDF template file (relative to public folder)
 * @returns {Promise<Blob>} - The generated PDF as a Blob
 */
export const generateLetterPDFFromTemplate = async (
  mainBody, 
  recipientName = "", // Not used (removed "To:" line)
  senderName = "", // Sender's first name for signature (on same line as closing)
  templatePath = "/template.pdf" // Default path - template should be in public folder
) => {
  try {
    // Load the template PDF
    const templateResponse = await fetch(templatePath);
    if (!templateResponse.ok) {
      throw new Error(`Failed to load template: ${templateResponse.statusText}`);
    }
    
    const templateBytes = await templateResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Get the first page of the template
    const pages = pdfDoc.getPages();
    if (pages.length === 0) {
      throw new Error('Template PDF has no pages');
    }
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    
    // Embed Dancing Script font from Google Fonts
    // pdf-lib supports TTF format best, so we'll try to get TTF version
    let dancingScriptFont;
    try {
      // Try multiple font URLs for better reliability
      const fontUrls = [
        'https://fonts.gstatic.com/s/dancingscript/v25/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSo3Sup8.ttf',
        'https://fonts.gstatic.com/s/dancingscript/v25/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSo3Sup8.woff2',
        'https://fonts.gstatic.com/s/dancingscript/v25/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSo3Sup8.woff',
      ];
      
      let fontLoaded = false;
      for (const fontUrl of fontUrls) {
        try {
          const fontResponse = await fetch(fontUrl, { 
            mode: 'cors',
            cache: 'no-cache' 
          });
          if (fontResponse.ok) {
            const fontBytes = await fontResponse.arrayBuffer();
            dancingScriptFont = await pdfDoc.embedFont(fontBytes);
            console.log('✅ Dancing Script font embedded successfully from:', fontUrl);
            fontLoaded = true;
            break;
          }
        } catch (err) {
          console.warn('⚠️ Failed to load font from', fontUrl, err);
          continue;
        }
      }
      
      if (!fontLoaded) {
        console.warn('⚠️ Could not load Dancing Script font from any source, using Helvetica');
        dancingScriptFont = helveticaFont;
      }
    } catch (error) {
      console.warn('⚠️ Error loading Dancing Script font, using Helvetica:', error);
      dancingScriptFont = helveticaFont;
    }
    
    // Text styling
    const textColor = rgb(0.12, 0.16, 0.23); // slate-800 equivalent
    
    // IMPORTANT: These coordinates need to match your template's layout
    // Use measureTemplate() helper to find the correct values
    // Default values work for templates with ~50pt margins and 80pt header/footer
    const margin = 100
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
   // Left/right margin in points (adjust based on your template borders)
    const headerHeight = 50; // Space reserved at top for header/decorations (adjust if needed)
    const footerHeight = 50; // Space reserved at bottom for signature/decorations (adjust if needed)
    
    const contentWidth = width - (margin * 2);
    const startY = height - margin - headerHeight - 10; // Start below header (PDF Y starts at bottom-left)
    const maxY = margin + footerHeight; // Bottom boundary for content
    
    // Add letter body text - preserve exact formatting including spacing and line breaks
    const fontSize = 11;
    const lineHeight = fontSize * 1.5; // 1.5x line height
    let currentY = startY; // Start at the top of content area
    
    // Function to wrap a single line if it exceeds content width
    // Use Dancing Script font for width calculation since that's what we'll render with
    const wrapLineIfNeeded = (line, maxWidth) => {
      const lineWidth = dancingScriptFont.widthOfTextAtSize(line, fontSize);
      if (lineWidth <= maxWidth) {
        return [line]; // Line fits, return as-is
      }
      
      // Line is too long, need to wrap it
      const words = line.split(/\s+/);
      const wrappedLines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = dancingScriptFont.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && currentLine) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        wrappedLines.push(currentLine);
      }
      
      return wrappedLines;
    };
    
    // Split mainBody by line breaks to preserve exact formatting
    const originalLines = mainBody.split('\n');
    
    for (let i = 0; i < originalLines.length; i++) {
      const originalLine = originalLines[i];
      
      // Wrap the line if it exceeds content width, otherwise use as-is
      const linesToDraw = wrapLineIfNeeded(originalLine, contentWidth);
      
      for (const line of linesToDraw) {
        // Check if we need a new page
        if (currentY < maxY && pages.length === 1) {
          // Add a new page with the template (clone first page)
          const [templatePage] = await pdfDoc.copyPages(pdfDoc, [0]);
          const newPage = pdfDoc.addPage(templatePage);
          pages.push(newPage);
          currentY = height - margin - 50; // Reset Y position
        }
        
        // Find the appropriate page (current page)
        const currentPageIndex = pages.length - 1;
        const currentPage = pages[currentPageIndex];
        
        // Draw the line (preserve empty lines for spacing)
        // Use Dancing Script font for letter body text
        if (line.trim() || originalLine === '') {
          currentPage.drawText(line, {
            x: margin,
            y: currentY,
            size: fontSize,
            font: dancingScriptFont,
            color: textColor,
          });
        }
        
        // Move to next line
        currentY -= lineHeight;
        
        // If we're on the last page and running out of space, add another page
        if (currentY < maxY && currentPageIndex === pages.length - 1) {
          const [templatePage] = await pdfDoc.copyPages(pdfDoc, [0]);
          const newPage = pdfDoc.addPage(templatePage);
          pages.push(newPage);
          currentY = height - margin - 50;
        }
      }
    }
    
    // Save the PDF (signature removed - letter content only)
    const pdfBytes = await pdfDoc.save();
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Letter_to_${recipientName}_${timestamp}.pdf`;
    
    // Create blob and download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return blob;
  } catch (error) {
    console.error('Error generating PDF from template:', error);
    throw error;
  }
};

// Re-export measureTemplate for convenience
export { measureTemplate } from './measureTemplate';


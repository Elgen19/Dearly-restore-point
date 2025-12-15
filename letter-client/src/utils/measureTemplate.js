// measureTemplate.js - Helper to measure PDF template dimensions and calculate text coordinates
import { PDFDocument } from 'pdf-lib';

/**
 * Measure template dimensions and help calculate text placement coordinates
 * This will log useful information about your template
 */
export const measureTemplate = async (templatePath = "/template.pdf") => {
  try {
    console.log('📏 Measuring template...');
    const templateResponse = await fetch(templatePath);
    
    if (!templateResponse.ok) {
      throw new Error(`Failed to load template: ${templateResponse.statusText}. Make sure template is in public folder.`);
    }
    
    const templateBytes = await templateResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    
    if (pages.length === 0) {
      throw new Error('Template PDF has no pages');
    }
    
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    
    // Convert points to common units
    const widthMM = (width * 25.4 / 72).toFixed(2);
    const heightMM = (height * 25.4 / 72).toFixed(2);
    const widthInches = (width / 72).toFixed(2);
    const heightInches = (height / 72).toFixed(2);
    
    console.log('📐 Template Dimensions:');
    console.log(`   Width: ${width} points (${widthMM} mm / ${widthInches} inches)`);
    console.log(`   Height: ${height} points (${heightMM} mm / ${heightInches} inches)`);
    console.log(`   Pages: ${pages.length}`);
    console.log('');
    
    // Common coordinates reference
    console.log('📍 Common Coordinate Reference:');
    console.log(`   Top-left corner: (0, ${height})`);
    console.log(`   Top-right corner: (${width}, ${height})`);
    console.log(`   Bottom-left corner: (0, 0)`);
    console.log(`   Bottom-right corner: (${width}, 0)`);
    console.log(`   Center: (${(width/2).toFixed(2)}, ${(height/2).toFixed(2)})`);
    console.log('');
    
    // Suggested coordinates for typical letter layout
    const suggestedMargin = 50; // 50 points = ~18mm from each side
    const suggestedHeaderHeight = 80; // Space for header/decorative top
    const suggestedFooterHeight = 80; // Space for signature/decorative bottom
    
    console.log('💡 Suggested Starting Coordinates:');
    console.log(`   Left margin: ${suggestedMargin} points (~${(suggestedMargin * 25.4 / 72).toFixed(2)} mm)`);
    console.log(`   Right margin: ${width - suggestedMargin} points`);
    console.log(`   Content start Y (from top): ${height - suggestedMargin - suggestedHeaderHeight} points`);
    console.log(`   Content end Y (from bottom): ${suggestedMargin + suggestedFooterHeight} points`);
    console.log(`   Content width: ${width - (suggestedMargin * 2)} points`);
    console.log('');
    
    // Test coordinates for different sections
    console.log('📝 Test Coordinates for Text Placement:');
    console.log(`   Header area (80pt from top): Y = ${height - 80}`);
    console.log(`   Content area start: Y = ${height - suggestedMargin - suggestedHeaderHeight}`);
    console.log(`   Content area end: Y = ${suggestedMargin + suggestedFooterHeight}`);
    console.log(`   Signature area (80pt from bottom): Y = 80`);
    console.log('');
    
    return {
      width,
      height,
      widthMM: parseFloat(widthMM),
      heightMM: parseFloat(heightMM),
      pages: pages.length,
      suggestedCoordinates: {
        margin: suggestedMargin,
        headerHeight: suggestedHeaderHeight,
        footerHeight: suggestedFooterHeight,
        contentStartY: height - suggestedMargin - suggestedHeaderHeight,
        contentEndY: suggestedMargin + suggestedFooterHeight,
        contentWidth: width - (suggestedMargin * 2),
      }
    };
  } catch (error) {
    console.error('❌ Error measuring template:', error);
    throw error;
  }
};

/**
 * Quick test - call this from browser console:
 * import { measureTemplate } from './utils/measureTemplate';
 * measureTemplate().then(result => console.log(result));
 */


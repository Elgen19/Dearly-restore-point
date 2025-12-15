// pdfGenerator.js - Utility for generating PDF from letter content
// Supports both template-based and programmatic generation
import jsPDF from 'jspdf';
import { generateLetterPDFFromTemplate } from './pdfGeneratorTemplate';

// Set this to true to use template-based PDF generation
// Template is located at: public/template.pdf (copied from src/templates/template.pdf)
const USE_TEMPLATE = true; // Using template mode
const TEMPLATE_PATH = '/template.pdf'; // Path to template in public folder

// Helper function to draw a heart shape using only basic shapes
const drawHeart = (doc, x, y, size, color) => {
  doc.setFillColor(...color);
  doc.setDrawColor(...color);
  
  const halfSize = size / 2;
  const radius = halfSize * 0.5;
  
  // Draw heart using two circles (top lobes) and overlapping circles for bottom point
  // Left circle (top left lobe)
  doc.circle(x - halfSize * 0.3, y - halfSize * 0.3, radius, 'F');
  // Right circle (top right lobe)
  doc.circle(x + halfSize * 0.3, y - halfSize * 0.3, radius, 'F');
  
  // Bottom point using overlapping circles to create heart shape
  const bottomY = y + halfSize * 0.2;
  // Left bottom circle
  doc.circle(x - halfSize * 0.15, bottomY, radius * 0.6, 'F');
  // Right bottom circle
  doc.circle(x + halfSize * 0.15, bottomY, radius * 0.6, 'F');
  // Center bottom circle to merge them
  doc.circle(x, bottomY + radius * 0.3, radius * 0.5, 'F');
  
  // Add a small circle at the very bottom to complete the point
  doc.circle(x, y + halfSize * 0.5, radius * 0.4, 'F');
};

// Helper function to draw decorative wheat/flower
const drawDecorativeWheat = (doc, x, y, size, color) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.2);
  
  // Stem
  doc.line(x, y, x, y + size);
  
  // Wheat heads (small circles)
  for (let i = 0; i < 3; i++) {
    const offsetX = (i - 1) * size * 0.3;
    const offsetY = y + size * 0.3 + i * size * 0.2;
    doc.circle(x + offsetX, offsetY, size * 0.15, 'FD');
  }
};

// Helper function to draw small decorative dots/pattern
const drawDecorativeDots = (doc, x, y, width, color) => {
  doc.setFillColor(...color);
  const dotSize = 0.5;
  const spacing = 3;
  
  for (let i = 0; i < width; i += spacing) {
    doc.circle(x + i, y, dotSize, 'F');
  }
};

export const generateLetterPDF = async (mainBody, recipientName = "Faith", senderName = "Elgen") => {
  // If using template, use template-based generation
  if (USE_TEMPLATE) {
    try {
      await generateLetterPDFFromTemplate(mainBody, recipientName, senderName, TEMPLATE_PATH);
      return;
    } catch (error) {
      console.error('Template-based PDF generation failed, falling back to programmatic:', error);
      // Fall through to programmatic generation
    }
  }
  
  // Otherwise, use programmatic generation (existing code)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set up colors (RGB values) - elegant, minimal palette
  const textColor = [30, 41, 59]; // slate-800
  const accentColor = [99, 102, 241]; // indigo-500
  const bgColor = [248, 250, 252]; // slate-50
  const borderColor = [203, 213, 225]; // slate-300

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - (margin * 2);

  // Clean background
  doc.setFillColor(...bgColor);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Simple, elegant border
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));

  // Letter content
  let yPos = margin + 20;
  
  // Recipient (subtle, elegant)
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`To: ${recipientName}`, margin, yPos);
  
  yPos += 15;
  
  // Subtle divider line
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Letter body - clean typography
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);

  // Split text into lines that fit the page width
  const lines = doc.splitTextToSize(mainBody || '', contentWidth);
  
  // Add text with proper line spacing
  lines.forEach((line, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - margin - 15) {
      doc.addPage();
      // Add background to new page
      doc.setFillColor(...bgColor);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      // Redraw border
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.5);
      doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
      yPos = margin + 15;
    }
    
    doc.text(line, margin, yPos);
    yPos += 5.5; // Comfortable line spacing
  });

  // Simple closing signature
  yPos += 10;
  if (yPos > pageHeight - margin - 20) {
    doc.addPage();
    doc.setFillColor(...bgColor);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
    yPos = margin + 15;
  }

  // Subtle closing line
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.line(pageWidth - margin - 50, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('With love,', pageWidth - margin - 45, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...textColor);
  doc.text('— Sender', pageWidth - margin - 45, yPos);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Letter_to_${recipientName}_${timestamp}.pdf`;

  // Save the PDF
  doc.save(filename);
};


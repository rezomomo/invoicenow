import { jsPDF } from 'jspdf';
import { InvoiceData, UserSettings } from '../types';

interface Position {
  x: number;
  y: number;
}

const COLORS = {
  primary: [0, 0, 0],
  secondary: [128, 128, 128],
  text: {
    dark: [0, 0, 0],
    gray: [89, 89, 89],
    light: [255, 255, 255],
  },
  background: {
    light: [250, 250, 250],
    zebra: [245, 245, 245],
  },
};

const drawHeader = (doc: jsPDF, margin: number, settings: UserSettings): Position => {
  const pageWidth = doc.internal.pageSize.width;
  
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setFillColor(...COLORS.secondary);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Left side - Company details
  doc.setTextColor(...COLORS.text.light);
  doc.setFontSize(22);
  doc.text(settings.company_name, margin, 20);
  doc.setFontSize(11);
  doc.text(settings.trading_name, margin, 30);

  // Right side - Company details
  const rightMargin = pageWidth - margin;
  doc.setTextColor(...COLORS.text.gray);
  doc.setFontSize(9);
  
  const addressLines = settings.address.split('\n');
  const companyDetails = [
    `REG NO: ${settings.registration_number}`,
    ...addressLines
  ];
  
  doc.text(companyDetails, rightMargin, 20, { align: 'right', lineHeightFactor: 1.5 });

  return { x: margin, y: 60 };
};

// Rest of the PDF generator functions remain the same
const drawInvoiceTitle = (doc: jsPDF, { x, y }: Position): Position => {
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(18);
  doc.text('Customer Invoice', x, y);
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(x, y + 3, x + 85, y + 3);

  return { x, y: y + 20 };
};

const drawBillingDetails = (doc: jsPDF, { x, y }: Position, invoiceData: InvoiceData, customerNote: string): Position => {
  const pageWidth = doc.internal.pageSize.width;
  const rightColumnX = pageWidth - 80;

  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text.gray);
  doc.text('BILLED TO', x, y);
  
  doc.setTextColor(...COLORS.text.dark);
  doc.setFontSize(9);
  
  let currentY = y + 12;
  
  const customerLines = doc.splitTextToSize(invoiceData.customer_name || '', 90);
  customerLines.forEach((line: string) => {
    doc.text(line, x, currentY);
    currentY += 5;
  });
  
  currentY += 3;
  
  const businessLines = doc.splitTextToSize(invoiceData.business_name || '', 90);
  businessLines.forEach((line: string) => {
    doc.text(line, x, currentY);
    currentY += 5;
  });
  
  currentY += 3;
  if (invoiceData.vat_number) {
    doc.text(invoiceData.vat_number, x, currentY);
    currentY += 10;
  }

  if (customerNote) {
    doc.setTextColor(...COLORS.text.gray);
    doc.setFontSize(11);
    doc.text('Invoices to/notes:', x, currentY);
    
    doc.setTextColor(...COLORS.text.dark);
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(customerNote, 90);
    currentY += 8;
    noteLines.forEach((line: string) => {
      doc.text(line, x, currentY);
      currentY += 5;
    });
  }

  doc.setTextColor(...COLORS.text.gray);
  doc.setFontSize(11);
  doc.text('INVOICE DETAILS', rightColumnX, y);
  
  doc.setTextColor(...COLORS.text.dark);
  doc.setFontSize(9);
  const date = new Date(parseInt(invoiceData.invoice_date) * 1000);
  doc.text([
    `Invoice Number: #${invoiceData.order_number}`,
    `Date: ${date.toLocaleDateString()}`
  ], rightColumnX, y + 12, { lineHeightFactor: 1.5 });

  return { x, y: currentY + 15 };
};

const drawItemsTable = (
  doc: jsPDF, 
  { x, y }: Position, 
  invoiceData: InvoiceData
): Position => {
  const pageWidth = doc.internal.pageSize.width;
  const tableWidth = pageWidth - (x * 2);
  
  doc.setFillColor(...COLORS.background.light);
  doc.rect(x, y, tableWidth, 10, 'F');
  
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(9);
  doc.text('Description', x + 5, y + 7);
  doc.text('Qty', pageWidth - 85, y + 7);
  doc.text('Unit Price', pageWidth - 60, y + 7);
  doc.text('Total', pageWidth - 35, y + 7);

  let currentY = y + 15;
  doc.setTextColor(...COLORS.text.dark);
  
  invoiceData.invoice_items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(...COLORS.background.zebra);
      doc.rect(x, currentY - 4, tableWidth, 12, 'F');
    }

    const descriptionLines = doc.splitTextToSize(item.description || '', 100);
    descriptionLines.forEach((line: string, lineIndex: number) => {
      doc.text(line, x + 5, currentY + (lineIndex * 4));
    });

    doc.text(item.quantity.toString(), pageWidth - 85, currentY);
    doc.text(`R${item.unit_price.toFixed(2)}`, pageWidth - 60, currentY);
    doc.text(`R${item.total.toFixed(2)}`, pageWidth - 35, currentY);

    currentY += Math.max(descriptionLines.length * 4 + 4, 12);
  });

  return { x, y: currentY + 5 };
};

const drawTotals = (
  doc: jsPDF, 
  { x, y }: Position, 
  invoiceData: InvoiceData
): Position => {
  const pageWidth = doc.internal.pageSize.width;
  const subtotal = invoiceData.invoice_items.reduce((sum, item) => sum + item.total, 0);
  
  doc.setDrawColor(230, 230, 240);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 100, y, pageWidth - x, y);

  y += 10;
  
  doc.setTextColor(...COLORS.text.gray);
  doc.setFontSize(9);
  doc.text('Subtotal:', pageWidth - 100, y);
  doc.setTextColor(...COLORS.text.dark);
  doc.text(`R${subtotal.toFixed(2)}`, pageWidth - 35, y, { align: 'right' });
  
  y += 8;
  doc.setTextColor(...COLORS.text.gray);
  doc.text('VAT:', pageWidth - 100, y);
  doc.setTextColor(...COLORS.text.dark);
  doc.text('0% VAT', pageWidth - 35, y, { align: 'right' });
  
  y += 12;
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(pageWidth - 100, y - 5, 80, 18, 2, 2, 'F');
  
  doc.setTextColor(...COLORS.text.light);
  doc.setFontSize(10);
  doc.text('TOTAL:', pageWidth - 95, y + 5);
  doc.text(`R${subtotal.toFixed(2)}`, pageWidth - 25, y + 5, { align: 'right' });

  return { x, y: y + 20 };
};

const drawFooter = (doc: jsPDF, margin: number, settings: UserSettings): void => {
  const pageWidth = doc.internal.pageSize.width;
  const footerY = doc.internal.pageSize.height - 15;
  
  doc.setTextColor(...COLORS.text.gray);
  doc.setFontSize(8);
  doc.text(`Generated by ${settings.company_name} Invoice System`, margin, footerY);
  doc.text('Page 1 of 1', pageWidth - margin, footerY, { align: 'right' });
};

export const generatePDF = (invoiceData: InvoiceData, customerNote: string, settings: UserSettings) => {
  const doc = new jsPDF();
  const margin = 20;
  let pos: Position = { x: margin, y: 0 };

  pos = drawHeader(doc, margin, settings);
  pos = drawInvoiceTitle(doc, pos);
  pos = drawBillingDetails(doc, pos, invoiceData, customerNote);
  pos = drawItemsTable(doc, pos, invoiceData);
  pos = drawTotals(doc, pos, invoiceData);
  drawFooter(doc, margin, settings);

  const pdfContent = doc.output('arraybuffer');
  window.pdfContent = pdfContent;
  
  doc.save(`invoice-${invoiceData.order_number}-${invoiceData.customer_name.replace(/[^a-zA-Z0-9]/g, '')}.pdf`);
};
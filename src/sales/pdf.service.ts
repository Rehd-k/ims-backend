import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs'; // For saving to file, if needed
import * as path from 'path'; // For path joining

// --- Interface for Receipt Data ---
export interface ReceiptItem {
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface ReceiptData {
    store_logo_text?: string; // Optional: For text-based logo
    store_name: string;
    store_address: string;
    store_phone?: string;
    store_email?: string;
    store_website?: string;

    receipt_no: string;
    date: string;
    time: string;
    cashier_name?: string;
    terminal_id?: string;

    customer_name?: string;
    customer_loyalty_id?: string;

    items: ReceiptItem[];

    currency_symbol: string;
    sub_total_amount: number;
    discount_percentage?: number;
    discount_amount?: number;
    tax_percentage?: number;
    tax_amount?: number;
    grand_total_amount: number;

    payment_method: string;
    amount_tendered?: number;
    change_due?: number;

    footer_message_line1?: string;
    footer_message_line2?: string;
    barcode_data?: string; // Data to be encoded in a real barcode
}

@Injectable()
export class PdfReceiptService {
    private readonly logger = new Logger(PdfReceiptService.name);

    // --- Helper function to draw a dashed line ---
    private drawDashedLine(
        doc: PDFKit.PDFDocument,
        x1: number,
        y: number,
        x2: number,
        dashLength = 2,
        spaceLength = 2,
    ) {
        doc.save();
        doc.lineWidth(0.5);
        doc.lineCap('butt').dash(dashLength, { space: spaceLength }).moveTo(x1, y).lineTo(x2, y).stroke();
        doc.restore();
    }

    async generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                // --- Document Setup ---
                // POS paper is typically 80mm or 58mm wide.
                // 80mm is approx 226.77 points (1 inch = 72 points)
                // 58mm is approx 164.41 points
                const receiptWidth = 226; // Using 80mm equivalent
                const leftMargin = 10;
                const contentWidth = receiptWidth - leftMargin * 2;
                let currentY = 15; // Initial Y position

                const doc = new PDFDocument({
                    size: [receiptWidth, 800], // Width, Height (height will be dynamic)
                    margins: {
                        top: 15,
                        bottom: 15,
                        left: leftMargin,
                        right: leftMargin,
                    },
                    bufferPages: true, // Important for getting the buffer
                });

                const buffers: Buffer[] = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });
                doc.on('error', (err) => {
                    this.logger.error('PDF generation error:', err);
                    reject(new InternalServerErrorException('Failed to generate PDF receipt.'));
                });
                doc.registerFont('naira', 'src/fonts/Roboto_Condensed-Regular.ttf');
                doc.registerFont('Poppins', 'src/fonts/Poppins-Regular.ttf');
                doc.registerFont('Poppins-Bold', 'src/fonts/Poppins-Bold.ttf');


                // --- Default Font ---
                // Using a common sans-serif font. For true POS look, you might need specific monospaced fonts.
                doc.font('Poppins');

                // --- Receipt Header ---
                if (data.store_logo_text) {
                    doc.fontSize(16).font('Poppins-Bold').text(data.store_logo_text, { align: 'center' });
                    currentY += 20;
                }
                doc.fontSize(10).font('Poppins-Bold').text(data.store_name, { align: 'center' });
                currentY += 12;
                doc.fontSize(7).font('Poppins').text(data.store_address, { align: 'center', width: contentWidth });
                currentY += (Math.ceil(doc.heightOfString(data.store_address, { width: contentWidth }) / doc.currentLineHeight())) * 8;

                if (data.store_phone) {
                    doc.text(`Phone: ${data.store_phone}`, { align: 'center' });
                    currentY += 8;
                }
                if (data.store_email) {
                    doc.text(`Email: ${data.store_email}`, { align: 'center' });
                    currentY += 8;
                }
                if (data.store_website) {
                    doc.text(data.store_website, { align: 'center' });
                    currentY += 10;
                }

                this.drawDashedLine(doc, leftMargin, currentY, receiptWidth - leftMargin);
                currentY += 8;

                // --- Transaction Info ---
                doc.fontSize(7).font('Poppins');
                doc.text(`Receipt No: ${data.receipt_no}`, leftMargin, currentY, { align: 'left' });
                currentY += 10;
                doc.text(`Date: ${data.date} ${data.time}`, leftMargin, currentY, { align: 'left' });
                currentY += 10;
                if (data.cashier_name) {
                    doc.text(`Cashier: ${data.cashier_name}`, leftMargin, currentY, { align: 'left' });
                    currentY += 10;
                }
                if (data.terminal_id) {
                    doc.text(`Terminal: ${data.terminal_id}`, leftMargin, currentY, { align: 'left' });
                    currentY += 10;
                }

                // --- Customer Info (Optional) ---
                if (data.customer_name) {
                    this.drawDashedLine(doc, leftMargin, currentY, receiptWidth - leftMargin);
                    currentY += 8;
                    doc.text(`Customer: ${data.customer_name}`, leftMargin, currentY, { align: 'left' });
                    currentY += 10;
                    if (data.customer_loyalty_id) {
                        doc.text(`Loyalty ID: ${data.customer_loyalty_id}`, leftMargin, currentY, { align: 'left' });
                        currentY += 10;
                    }
                }

                this.drawDashedLine(doc, leftMargin, currentY, receiptWidth - leftMargin);
                currentY += 8;

                // --- Items Table Header ---
                doc.font('Poppins-Bold');
                const itemColX = leftMargin;
                const qtyColX = leftMargin + contentWidth * 0.55; // Adjusted column positions
                const priceColX = leftMargin + contentWidth * 0.70;
                const totalColX = leftMargin + contentWidth * 0.85;

                doc.text('Item', itemColX, currentY);
                doc.text('Qty', qtyColX, currentY, { width: contentWidth * 0.15, align: 'center' });
                doc.text('Price', priceColX, currentY, { width: contentWidth * 0.15, align: 'right' });
                doc.text('Total', totalColX, currentY, { width: contentWidth * 0.15, align: 'right' });
                currentY += 12;
                doc.font('Poppins');

                // --- Items List ---
                data.items.forEach(item => {
                    const itemText = item.name;
                    const itemHeight = doc.heightOfString(itemText, { width: contentWidth * 0.50 });

                    doc.text(itemText, itemColX, currentY, { width: contentWidth * 0.50, align: 'left' });
                    doc.text(item.quantity.toString(), qtyColX, currentY, { width: contentWidth * 0.15, align: 'center' });
                    doc.text(item.price.toFixed(2), priceColX, currentY, { width: contentWidth * 0.15, align: 'right' });
                    doc.text(item.subtotal.toFixed(2), totalColX, currentY, { width: contentWidth * 0.15, align: 'right' });
                    currentY += Math.max(10, itemHeight + 2); // Adjust Y based on item name height
                });
                currentY += 5;

                this.drawDashedLine(doc, leftMargin, currentY, receiptWidth - leftMargin);
                currentY += 8;

                // --- Totals Section ---
                const totalsLabelX = leftMargin;
                const totalsValueX = receiptWidth - leftMargin - (contentWidth * 0.3); // Align right

                doc.font('Poppins');
                doc.text('Subtotal:', totalsLabelX, currentY);
                doc.font('naira');
                doc.text(`${data.currency_symbol} ${data.sub_total_amount.toFixed(2)}`, totalsValueX, currentY, { align: 'right', width: contentWidth * 0.3 });
                currentY += 12;

                if (data.discount_amount && data.discount_percentage !== undefined) {
                    doc.text(`Discount (${data.discount_percentage}%):`, totalsLabelX, currentY);
                    doc.font('naira');
                    doc.text(`${data.currency_symbol} -${data.discount_amount.toFixed(2)}`, totalsValueX, currentY, { align: 'right', width: contentWidth * 0.3 });
                    currentY += 12;
                }

                if (data.tax_amount && data.tax_percentage !== undefined) {
                    doc.text(`Tax (${data.tax_percentage}%):`, totalsLabelX, currentY);
                    doc.font('naira');
                    doc.text(`${data.currency_symbol} ${data.tax_amount.toFixed(2)}`, totalsValueX, currentY, { align: 'right', width: contentWidth * 0.3 });
                    currentY += 12;
                }

                doc.font('Poppins-Bold').fontSize(9);
                doc.text('TOTAL:', totalsLabelX, currentY);
                doc.font('naira');
                doc.text(`${data.currency_symbol} ${data.grand_total_amount.toFixed(2)}`, totalsValueX, currentY, { align: 'right', width: contentWidth * 0.3 });
                currentY += 15;
                doc.font('Poppins').fontSize(7);


                // --- Payment Info ---
                this.drawDashedLine(doc, leftMargin, currentY, receiptWidth - leftMargin);
                currentY += 8;
                doc.text(`Payment Method: ${data.payment_method}`, leftMargin, currentY);
                currentY += 10;
                if (data.amount_tendered !== undefined) {
                    doc.font('naira');
                    doc.text(`Amount Tendered: ${data.currency_symbol} ${data.amount_tendered.toFixed(2)}`, leftMargin, currentY);
                    currentY += 10;
                }
                if (data.change_due !== undefined) {
                    doc.font('naira');
                    doc.text(`Change Due: ${data.currency_symbol}${data.change_due.toFixed(2)}`, leftMargin, currentY);
                    currentY += 10;
                }

                // --- Barcode Placeholder ---
                if (data.barcode_data) {
                    this.drawDashedLine(doc, leftMargin, currentY, receiptWidth - leftMargin);
                    currentY += 8;
                    doc.fontSize(6).text('*** BARCODE AREA ***', { align: 'center' });
                    currentY += 8;
                    doc.fontSize(7).text(data.barcode_data, { align: 'center' }); // Displaying data as text
                    // For actual barcode, you'd use a library like bwip-js to generate an image
                    // and then use doc.image()
                    currentY += 12;
                }


                // --- Footer ---
                this.drawDashedLine(doc, leftMargin, currentY, receiptWidth - leftMargin);
                currentY += 10;
                if (data.footer_message_line1) {
                    doc.fontSize(7).text(data.footer_message_line1, { align: 'center', width: contentWidth });
                    currentY += 10;
                }
                if (data.footer_message_line2) {
                    doc.text(data.footer_message_line2, { align: 'center', width: contentWidth });
                    currentY += 10;
                }

                // Finalize the PDF and end the stream
                doc.end();

            } catch (error) {
                this.logger.error('Error in generateReceiptPdf:', error);
                reject(new InternalServerErrorException('An unexpected error occurred while generating the PDF.'));
            }
        });
    }
}

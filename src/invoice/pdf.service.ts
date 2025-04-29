import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
const naira = '\u20A6';

@Injectable()
export class PdfGeneratorService {
    async generateInvoicePdf(invoiceData: any): Promise<Buffer> {
        const doc = new PDFDocument({ margin: 50 });
        doc.registerFont('naira', 'src/fonts/Roboto_Condensed-Regular.ttf');
        doc.registerFont('Poppins', 'src/fonts/Poppins-Regular.ttf');
        doc.registerFont('Poppins-Bold', 'src/fonts/Poppins-Bold.ttf');
        const buffers: Buffer[] = [];
        const text = 'KTG';

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => { });


        // === Colors ===
        const beige = '#eae3db';
        const black = '#000000';
        const radius = 30;

        // === Fonts ===
        doc.fontSize(12).fillColor(black);

        // === Header Logo and Title ===
        // doc.image('src/invoice/logo.png', doc.page.width / 2 - 20, 0, { width: 40 });
        doc.circle(doc.page.width / 2 - 20, 50, radius)
            .strokeColor('black')
            .lineWidth(1)
            .stroke();

        doc
            .font('Poppins-Bold')
            .fontSize(18)
            .text(
                text,
                doc.page.width / 2 - 39,
                40
            );
        // doc.image('src/invoice/logo.png', 270, 40, { width: 60 }); // Adjust path and position
        doc
            .font('Poppins-Bold')
            .fontSize(20)
            .text('KINZO-TECH GLOBAL', 40, 90, { align: 'center' });
        doc
            .font('Poppins')
            .fontSize(10)
            .fillColor('#666666')
            .text('design & branding', { align: 'center' });

        // === Client Info & Invoice Details ===
        doc.moveDown(2);
        doc
            .font('Poppins-Bold')
            .text('ISSUED TO:', 50, 170)
            .font('Poppins')
            .text(`${invoiceData.customer.name} \n${invoiceData.customer.address ?? '-'} \n${invoiceData.customer.phone_number ?? ''}`);

        doc
            .font('Poppins-Bold')
            .text('INVOICE NO:', 400, 170)
            .font('Poppins')
            .text(`${invoiceData.invoiceNumber}`, 480, 170)
            .text(`DATE: ${new Date(invoiceData.issuedDate).toLocaleDateString()}`, 400, 190)
            .text(`DUE DATE: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, 400, 210);

        // === Item Section Header ===
        doc
            .rect(50, 250, 500, 20)
            .fill(beige)
            .fillColor('#000')
            .font('Poppins-Bold')
            .text('DESCRIPTION', 55, 255)
            .text('UNIT PRICE', 255, 255)
            .text('QTY', 355, 255)
            .text('TOTAL', 455, 255);

        // === Items (no borders, just spacing) ===


        let y = 280;
        doc.font('Poppins').fillColor('#000');
        invoiceData.items.forEach(item => {

            doc.text(item.title, 55, y)

            doc
                .font('naira')
                .text(`₦${item.price.toString()}`, 255, y);


            doc.text(item.quantity.toString(), 355, y);

            doc
                .font('naira')
                .text(`₦${item.total.toString()}`, 455, y);
            y += 20;
        });
        doc.moveDown()
        doc.text(`----------`, 455, y);

        doc
            .font('Poppins-Bold')
            .text('Discount', 55, y);
        doc
            .font('naira')
            .text(`(₦${invoiceData.discount.toString()})`, 455, y);
        y += 20;


        // === Subtotal & Tax ===
        const subtotal = invoiceData.totalAmount + invoiceData.tax;

        const total = invoiceData.totalAmount;

        doc
            .font('Poppins-Bold')
            .text('SUBTOTAL', 355, y + 20)
            .font('naira')
            .text(`₦${subtotal}`, 455, y + 20);

        doc
            .font('Poppins-Bold')
            .text('Tax', 355, y + 40)
            .font('Poppins')
            .text(`${invoiceData.tax}`, 455, y + 40);

        // === Total Section with Beige Background ===
        doc
            .rect(50, y + 70, 500, 20)
            .fill(beige)
            .fillColor('#000')
            .font('Poppins-Bold')
            .text('TOTAL', 355, y + 75)
            .font('naira')
            .text(`₦${total}`, 455, y + 75);

        // === Bank Details ===
        doc
            .moveDown()
            .font('Poppins-Bold')
            .text('BANK DETAILS', 450, y + 120)
            .font('Poppins')
            .text('Your Bank\nAccount Name: Your Bank Name\nAccount No.: 0123 4567 8901', 450, y + 135);

        // === Thank You + Signature (replace with image if needed) ===
        doc
            .font('Poppins-Bold')
            .text('Note', 50, y + 120)
            .font('Poppins')
            .text(invoiceData.note, 50, y + 135)
        // .image('signature.png', 420, y + 150, { width: 100 }); // Replace with actual path

        doc.end();

        const resultBuffer = await new Promise<Buffer>((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
        });

        return resultBuffer;
    }
}

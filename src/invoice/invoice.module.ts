import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './invoice.schema';
import { ActivityModule } from 'src/activity/activity.module';
import { PdfGeneratorService } from './pdf.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    ActivityModule
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, PdfGeneratorService, WhatsappService],

  // WhatsappService


})
export class InvoiceModule { }

import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './invoice.schema';
import { ActivityModule } from 'src/activity/activity.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    ActivityModule,
    ProductModule
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],


  // WhatsappService


})
export class InvoiceModule { }

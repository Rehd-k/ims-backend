import { forwardRef, Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { ProductModule } from 'src/product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/product/product.schema';
import { Sale, SaleSchema } from './sales.schema';
import { PurchasesModule } from 'src/purchases/purchases.module';
import { CustomerModule } from 'src/customer/customer.module';
import { ActivityModule } from 'src/activity/activity.module';
import { PdfReceiptService } from './pdf.service';

@Module({
  imports: [
    forwardRef(() => ProductModule),
    CustomerModule,
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema }
    ]),
    PurchasesModule,
    ActivityModule
  ],
  providers: [SalesService, PdfReceiptService],
  controllers: [SalesController],
  exports: [SalesService]
})
export class SalesModule { }

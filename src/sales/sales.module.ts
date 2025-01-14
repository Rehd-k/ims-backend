import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { ProductModule } from 'src/product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/product/product.schema';
import { Sale, SaleSchema } from './sales.schema';

@Module({
  imports: [
    ProductModule,
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema }
    ]),
  ],
  providers: [SalesService],
  controllers: [SalesController]
})
export class SalesModule { }

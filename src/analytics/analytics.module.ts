import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Sale, SaleSchema } from 'src/sales/sales.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/product/product.schema';
import { Expenses, ExpensesSchema } from 'src/expense/expenses.schema';
import { Customer, CustomerSchema } from 'src/customer/customer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: Product.name, schema: ProductSchema },
      {
        name: Expenses.name, schema: ExpensesSchema

      },
      { name: Customer.name, schema: CustomerSchema, }
    ]),

  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController]
})
export class AnalyticsModule { }

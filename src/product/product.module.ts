import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    NotificationsModule
  ],
  providers: [ProductService, InventoryService],
  controllers: [ProductController],
  exports: [ProductService, InventoryService]
})
export class ProductModule { }

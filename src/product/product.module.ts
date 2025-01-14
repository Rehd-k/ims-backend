import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from './product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    NotificationsService
  ],
  providers: [ProductService, InventoryService],
  controllers: [ProductController],
  exports : [InventoryService]
})
export class ProductModule { }

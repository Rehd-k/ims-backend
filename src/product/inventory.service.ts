import { Injectable, BadRequestException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class InventoryService {
    constructor(@InjectModel('Product') private readonly productModel: Model<Product>, private readonly notificationService: NotificationsService) { }

    async restockProduct(productId: string, quantity: number): Promise<any> {
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new BadRequestException('Product not found');
        }

        product.quantity += quantity;
        return await product.save();
    }

    async deductStock(productId: string, quantity: number): Promise<any> {
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new BadRequestException('Product not found');
        }

        if (product.quantity < quantity) {
            throw new BadRequestException('Insufficient stock');
        }

        product.quantity -= quantity;

        // Check for low stock
        if (product.quantity <= product.roq) {
            await this.notifyAdminLowStock(product);
        }

        return product.save();
    }

    private async notifyAdminLowStock(product: any): Promise<void> {
        // Implement your notification logic here
        console.log(`Low Stock Alert: Product ${product.name} has only ${product.quantity} items left.`);
        // You can send an email, push notification, or log the alert
        this.notificationService.createNotification(
            'LowStock',
            `Product ${product.name} is running low on stock.`,
            ['Admin'],
        );
    }
}

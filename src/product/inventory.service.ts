import { Injectable, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PurchasesService } from 'src/purchases/purchases.service';
import { SalesService } from 'src/sales/sales.service';

@Injectable()
export class InventoryService {
    constructor(
        @InjectModel('Product') private readonly productModel: Model<Product>,
        private readonly notificationService: NotificationsService,
        @Inject(forwardRef(() => PurchasesService)) private readonly purchasesService: PurchasesService,
        @Inject(forwardRef(() => SalesService)) private readonly saleService: SalesService
    ) { }

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

    async getDashboardData(id: string, startDate: Date, endDate: Date): Promise<any> {
        const saleInfo = await this.saleService.getDashboardData(id, startDate, endDate);
        const purchsesinfo = await this.purchasesService.getDashboardData(id);
        const product = await this.productModel.findById(id);

        return {
            total_sales: saleInfo.length > 0 ? saleInfo[0].totalAmount : 0,
            total_purchases: purchsesinfo[0].totalPurchases,
            total_sales_value: saleInfo.length > 0 ? saleInfo[0].totalPrice : 0,
            total_cost_purchases: purchsesinfo[0].totalPayableSum,
            profits: (saleInfo.length > 0 ? saleInfo[0].totalPrice : 0) - purchsesinfo[0].totalPayableSum,
            damaged_goods: purchsesinfo[0].damagedGoods,
            debt: purchsesinfo[0].debt,
            expired_goods: purchsesinfo[0].expiredGoods,
            quanity: product.quantity,

        }
    }

    async h(id: string): Promise<any> {
        // total sales
        // total purchases
        // profits 
        // total sales value
        // total suppliers
        // total products in stock
        // total products out of stock

    }
}

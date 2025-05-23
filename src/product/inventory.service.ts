import { Injectable, BadRequestException, forwardRef, Inject, InternalServerErrorException } from '@nestjs/common';
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

    async addToSold(productId: string, quantity: number): Promise<any> {
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new BadRequestException('Product not found');
        }

        product.sold += quantity;
        await product.save();
    }

    async deductFromSold(productId: string, quantity: number): Promise<any> {
        const product = await this.productModel.findById(productId);
        if (!product) {
            throw new BadRequestException('Product not found');
        }

        if (product.sold < quantity) {
            throw new BadRequestException('Somthings Not Right');
        }

        product.sold -= quantity;

        await product.save();
    }

    async deductStock(productId: string, quantity: number, req: any): Promise<any> {
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
            await this.notifyAdminLowStock(product, req);
        }

        return product.save();
    }

    private async notifyAdminLowStock(product: any, req: any): Promise<void> {
        // Implement your notification logic here
        // You can send an email, push notification, or log the alert
        this.notificationService.createNotification(
            'LowStock',
            `Product ${product.name} is running low on stock.`,
            ['Admin'],
            req
        );
    }

    async getDashboardData(id: string, startDate: Date, endDate: Date, req: any): Promise<any> {

        try {
            // const saleInfo = await this.saleService.getDashboardData(id, startDate, endDate, req);
            const purchsesinfo = await this.purchasesService.getDashboardData(id);
            // const product = await this.productModel.findById(id);
            return purchsesinfo[0];
            // return {
            //     total_sales: saleInfo.length ? saleInfo[0].totalAmount : 0,
            //     total_purchases: purchsesinfo.length ? purchsesinfo[0].totalPurchases : 0,
            //     total_sales_value: saleInfo.length ? saleInfo[0].totalPrice : 0,
            //     total_cost_purchases: purchsesinfo.length ? purchsesinfo[0].totalPayableSum : 0,
            //     profits: purchsesinfo.length ? (saleInfo.length > 0 ? saleInfo[0].totalPrice : 0) - purchsesinfo[0].totalPayableSum : 0,
            //     damaged_goods: purchsesinfo.length ? purchsesinfo[0].damagedGoods : 0,
            //     debt: purchsesinfo.length ? purchsesinfo[0].debt : 0,
            //     expired_goods: purchsesinfo.length ? purchsesinfo[0].expiredGoods : 0,
            //     quanity: product ? product.quantity : 0,

            // }
        } catch (error) {
            return new InternalServerErrorException(error)
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

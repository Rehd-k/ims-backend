import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from 'src/product/product.schema';
import { Supplier } from './supplier.schema';

@Injectable()
export class SupplierService {
    constructor(
        @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
        @InjectModel(Product.name) private readonly productModel: Model<Product>,
    ) { }

    async createSupplier(data: any): Promise<any> {
        const supplier = new this.supplierModel(data);
        return supplier.save();
    }

    async addOrder(supplierId: string, order: any): Promise<any> {
        const supplier = await this.supplierModel.findById(supplierId);
        if (!supplier) {
            throw new BadRequestException('Supplier not found');
        }

        let totalCost = 0;
        for (const item of order.items) {
            const product = await this.productModel.findById(item.productId);
            if (!product) {
                throw new BadRequestException(`Product with ID ${item.productId} not found`);
            }
            totalCost += product.price * item.quantity;
        }

        order.totalCost = totalCost;
        supplier.orders.push(order);
        supplier.outstandingBalance += totalCost;
        return supplier.save();
    }

    async recordPayment(supplierId: string, payment: any): Promise<any> {
        const supplier = await this.supplierModel.findById(supplierId);
        if (!supplier) {
            throw new BadRequestException('Supplier not found');
        }

        supplier.payments.push(payment);
        supplier.outstandingBalance -= payment.amount;

        if (supplier.outstandingBalance < 0) {
            supplier.outstandingBalance = 0; // Avoid negative balances
        }

        return supplier.save();
    }

    async getSupplierDetails(supplierId: string): Promise<any> {
        return this.supplierModel.findById(supplierId).populate('orders.items.product').exec();
    }
}

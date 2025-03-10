import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase } from './purchases.schema';
import { SupplierService } from 'src/supplier/supplier.service';
import { ProductService } from 'src/product/product.service';
import { QueryDto } from 'src/product/query.dto';

@Injectable()
export class PurchasesService {
    constructor(@InjectModel(Purchase.name) private purchaseModel: Model<Purchase>, private supplierService: SupplierService, @Inject(forwardRef(() => ProductService)) private productService: ProductService) { }

    async create(createPurchaseDto: any): Promise<Purchase> {
        console.log(createPurchaseDto);
        const createdPurchase = new this.purchaseModel(createPurchaseDto);
        const order = await createdPurchase.save();

        await this.productService.increaseAmount(createdPurchase.productId, createdPurchase.quantity);
        await this.supplierService.addOrder(createdPurchase.supplier, order._id);
        return order
    }

    async getDashboardData(id: string): Promise<{ totalPurchases: number; totalPayableSum: number, damagedGoods: number, debt: number, expiredGoods: number }[]> {
        const result = await this.purchaseModel.aggregate([
            { $match: { productId: id } }, // Filter documents containing the productId
            {
                $group: {
                    _id: null,
                    totalPurchases: { $sum: 1 },
                    totalPayableSum: { $sum: "$totalPayable" },
                    damagedGoods: { $sum: "$damagedGoods.quantity" },
                    debt: { $sum: "$debt" },
                    expiredGoods: { $sum: { $gte: ["$expiryDate", new Date()] } } //come back to this

                }
            }
        ]);
        return result;
    }

    async recordPayment(orderId: Types.ObjectId, payment: {
        date: Date;
        amountPaid: { transfer: number, cash: number, card: number }
    }): Promise<any> {
        const order = await this.purchaseModel.findById(orderId);
        if (!order) {
            throw new BadRequestException('Order not found');
        }

        order.outStandingPayments.push(payment);
        let paymentTotal = payment.amountPaid.card + payment.amountPaid.cash + payment.amountPaid.transfer
        order.debt = order.debt - paymentTotal;

        return order.save();
    }

    async findAll(query: QueryDto): Promise<Purchase[]> {
        const {
            filter = '{}',
            sort = '{}',
            skip = 0,
            select = '',
            limit = 10
        } = query;

        const parsedFilter = JSON.parse(filter);
        const parsedSort = JSON.parse(sort);
        let stuff = await this.purchaseModel.aggregate([
            { $match: { ...parsedFilter, createdAt: { $gte: new Date(query.startDate), $lte: new Date(query.endDate) } }, },

            {
                $sort: parsedSort
            },
            { $limit: Number(limit) },
            { $skip: Number(skip) },
            // { $project: { select } },
            { $lookup: { from: 'suppliers', localField: 'supplier', foreignField: '_id', as: 'supplier' } }
        ]).exec();
        return stuff;
    }

    async findOne(id: string): Promise<Purchase> {
        return this.purchaseModel.findById(id).exec();
    }

    async update(id: string, updatePurchaseDto: any): Promise<Purchase> {
        return this.purchaseModel.findByIdAndUpdate(id, updatePurchaseDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Purchase> {
        return this.purchaseModel.findByIdAndDelete(id).exec();
    }


    async editSoldQuantity(id: string, amount: number) {
        const purchase = await this.purchaseModel.findById(id)
        purchase.sold -= amount;
        await purchase.save();
        return purchase
    }




    async findFirstUnsoldPurchase(productId: string) {
        const purchase = await this.purchaseModel.findOne({
            productId: productId,
            $expr: { $lt: ["$sold", "$quantity"] }
        }).sort({ createdAt: 1 }).exec();
        return purchase
    }
}

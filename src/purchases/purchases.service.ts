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

    async create(createPurchaseDto: any, req: any): Promise<Purchase> {
        try {
            createPurchaseDto.location = req.user.location;
            const createdPurchase = new this.purchaseModel(createPurchaseDto);
            const order = await createdPurchase.save();
            await this.productService.increaseAmount(createdPurchase.productId, createdPurchase.quantity);
            await this.supplierService.addOrder(createdPurchase.supplier, order._id);
            return order
        } catch (error) {
            console.error(error);
            throw new BadRequestException('Failed to create purchase');
        }

    }

    async getDashboardData(id: string): Promise<{ totalPurchases: number; totalPayableSum: number, damagedGoods: number, debt: number, expiredGoods: number }[]> {
        const result = await this.purchaseModel.aggregate([
            { $match: { productId: id } }, // Filter documents containing the productId
            { $unwind: "$damagedGoods" },
            {

                $group: {
                    _id: "$damagedGoods",
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

    async findAll(query: QueryDto, req: any): Promise<Purchase[]> {
        const {
            filter = '{}',
            sort = '{}',
            skip = 0,
            select = '',
            limit = 10
        } = query;
        try {
            const parsedFilter = JSON.parse(filter);
            const parsedSort = JSON.parse(sort);
            const keys = Object.keys(parsedFilter);

            const startDate = new Date(query.startDate);
            startDate.setHours(0, 0, 0, 0); // Start of the startDate

            const endDate = new Date(query.endDate);
            endDate.setHours(23, 59, 59, 999);
            keys.forEach(key => {
                if (key == 'createdAt') {
                    parsedFilter[key] = { $gte: startDate, $lte: endDate }
                } else if (key == 'expiryDate') {
                    parsedFilter[key] = { $gte: startDate, $lte: endDate };
                } else if (key == 'purchaseDate') {
                    parsedFilter[key] = { $gte: startDate, $lte: endDate };
                } else if (key == 'deliveryDate') {
                    parsedFilter[key] = { $gte: startDate, $lte: endDate };
                }
            });
            if (parsedFilter.supplier === '') {
                delete parsedFilter.supplier
            }
            const purchases = await this.purchaseModel
                .find({ ...parsedFilter, location: req.user.location }) // Apply filtering
                .sort(parsedSort)   // Sorting
                .limit(Number(limit))
                .skip(Number(skip))
                .select(select)     // Projection of main document fields
                .populate({
                    path: 'supplier',
                    select: 'name' // Selecting only the 'name' field from the supplier
                })
                .exec();
            return purchases;
        } catch (error) {
            console.error(error);
            throw new BadRequestException(error);
        }
    }

    async findOne(id: string): Promise<Purchase> {
        return this.purchaseModel.findById(id).exec();
    }

    async update(id: string, updatePurchaseDto: any) {
        try {
            const product = await this.productService.findOne(updatePurchaseDto.productId);
            product.quantity = product.quantity - Number(updatePurchaseDto.damagedGoods.quantity);
            const purchace = await this.purchaseModel.findById(id);
            delete updatePurchaseDto.productId;
            purchace.damagedGoods = updatePurchaseDto.damagedGoods;

            await product.save();
            await purchace.save();
        } catch (error) {
            console.error(error);
        }

    }

    async remove(id: string): Promise<Purchase> {
        return this.purchaseModel.findByIdAndDelete(id).exec();
    }


    async editSoldQuantity(id: string, amount: number, price: number) {
        const purchase = await this.purchaseModel.findById(id)
        const productindex = purchase.sold.findIndex((item) => item.price == price)
        purchase.sold[productindex].amount -= amount
        if (purchase.sold[productindex].amount < 1) {
            purchase.sold.splice(productindex, 1)
        }
        await purchase.save();
        return purchase
    }


    async findFirstUnsoldPurchase(productId: string, req: any) {
        const purchase = await this.purchaseModel.findOne({
            productId: productId,
            $expr: { $lt: [{ $sum: "$sold.amount" }, "$quantity"] },
            location: req.user.location
        }).sort({ createdAt: 1 }).exec();

        return purchase;
    }
}

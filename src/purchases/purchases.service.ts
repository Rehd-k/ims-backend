import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase } from './purchases.schema';
import { SupplierService } from 'src/supplier/supplier.service';
import { ProductService } from 'src/product/product.service';
import { QueryDto } from 'src/product/query.dto';
import { log } from 'src/do_logger';

@Injectable()
export class PurchasesService {
    constructor(@InjectModel(Purchase.name) private purchaseModel: Model<Purchase>, private supplierService: SupplierService, @Inject(forwardRef(() => ProductService)) private productService: ProductService) { }

    async create(createPurchaseDto: any, req: any): Promise<Purchase> {
        try {
            createPurchaseDto.location = req.user.location;
            createPurchaseDto.initiator = req.user.username;
            const createdPurchase = new this.purchaseModel(createPurchaseDto);
            const order = await createdPurchase.save();
            await this.productService.increaseAmount(createdPurchase.productId, createdPurchase.quantity);
            await this.supplierService.addOrder(createdPurchase.supplier, order._id);
            return order
        } catch (error) {
            log(`Failed to create purchase ${error}`, "ERROR")
            throw new BadRequestException('Failed to create purchase');
        }

    }

    async getDashboardData(id: string) {
        const pipeline = [
            { $match: { productId: id } },
            {
                $addFields: {
                    unitPrice: { $cond: [{ $eq: ["$quantity", 0] }, 0, { $divide: ["$total", "$quantity"] }] },
                    totalSoldAmount: { $sum: "$sold.amount" },
                    totalSoldValue: {
                        $sum: {
                            $map: {
                                input: "$sold",
                                as: "s",
                                in: { $multiply: ["$$s.amount", "$$s.price"] }
                            }
                        }
                    },
                    totalDamagedQuantity: {
                        $cond: [
                            { $isArray: "$damagedGoods" },
                            { $sum: "$damagedGoods.quantity" },
                            "$damagedGoods.quantity"
                        ]
                    },
                    totalDamagedValue: {
                        $cond: [
                            { $isArray: "$damagedGoods" },
                            { $sum: { $map: { input: "$damagedGoods", as: "d", in: { $multiply: ["$$d.quantity", "$unitPrice"] } } } },
                            { $multiply: ["$damagedGoods.quantity", "$unitPrice"] }
                        ]
                    },
                    totalExpiredQuantity: {
                        $cond: [
                            { $isArray: "$damagedGoods" },
                            { $sum: { $map: { input: "$damagedGoods", as: "d", in: { $cond: [{ $eq: ["$$d.type", "expired"] }, "$$d.quantity", 0] } } } },
                            { $cond: [{ $eq: ["$damagedGoods.type", "expired"] }, "$damagedGoods.quantity", 0] }
                        ]
                    },
                    totalExpiredValue: {
                        $cond: [
                            { $isArray: "$damagedGoods" },
                            { $sum: { $map: { input: "$damagedGoods", as: "d", in: { $cond: [{ $eq: ["$$d.type", "expired"] }, { $multiply: ["$$d.quantity", "$unitPrice"] }, 0] } } } },
                            { $cond: [{ $eq: ["$damagedGoods.type", "expired"] }, { $multiply: ["$damagedGoods.quantity", "$unitPrice"] }, 0] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalSoldAmount" },
                    totalSalesValue: { $sum: "$totalSoldValue" },
                    totalPurchases: { $sum: 1 },
                    totalPurchasesValue: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
                    // Only change this line to show profit only for sold items:
                    totalProfit: { $sum: { $subtract: ["$totalSoldValue", { $multiply: ["$totalSoldAmount", "$unitPrice"] }] } },
                    quantity: { $sum: "$quantity" },
                    totalDamagedQuantity: { $sum: "$totalDamagedQuantity" },
                    totalDamagedValue: { $sum: "$totalDamagedValue" },
                    totalExpiredQuantity: { $sum: "$totalExpiredQuantity" },
                    totalExpiredValue: { $sum: "$totalExpiredValue" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSales: 1,
                    totalSalesValue: 1,
                    totalPurchases: 1,
                    totalPurchasesValue: 1,
                    totalProfit: 1,
                    quantity: 1,
                    totalDamagedQuantity: 1,
                    totalDamagedValue: 1,
                    totalExpiredQuantity: 1,
                    totalExpiredValue: 1
                }
            }
        ];

        const noOrder = [
            {
                totalSales: 0,
                totalSalesValue: 0,
                totalPurchases: 0,
                totalPurchasesValue: 0,
                totalProfit: 0,
                quantity: 0,
                totalDamagedQuantity: 0,
                totalDamagedValue: 0,
                totalExpiredQuantity: 0,
                totalExpiredValue: 0
            }
        ]

        const result = await this.purchaseModel.aggregate(pipeline).exec();
        if (result.length === 0) {
            return noOrder;
        }
        return result;
    }

    async recordPayment(orderId: Types.ObjectId, payment: {
        date: Date;
        amountPaid: { transfer: number, cash: number, card: number }
    }): Promise<any> {
        try {
            const order = await this.purchaseModel.findById(orderId);
            if (!order) {
                throw new BadRequestException('Order not found');
            }

            order.outStandingPayments.push(payment);
            let paymentTotal = payment.amountPaid.card + payment.amountPaid.cash + payment.amountPaid.transfer
            order.debt = order.debt - paymentTotal;

            return order.save();
        } catch (error) {
            log(`Record Payment error ${error}`, "ERROR")
            throw new BadRequestException('Record Payment error');
        }

    }

    async findAll(query: QueryDto, req: any): Promise<{ purchases: Purchase[], totalDocuments: number }> {
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
            endDate.setHours(24, 59, 59, 999);
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

                delete parsedFilter.status
            }

            if (parsedFilter.status === '') {
                delete parsedFilter.status
            }
            const purchases = await this.purchaseModel
                .find({ ...parsedFilter, location: req.user.location }) // Apply filtering
                .sort(parsedSort)   // Sorting
                .limit(Number(limit))
                .skip(Number(skip))
                .select(`${select}`)     // Projection of main document fields
                .populate({
                    path: 'supplier',
                    select: 'name' // Selecting only the 'name' field from the supplier
                })
                .exec();
            const totalDocuments = await this.purchaseModel
                .countDocuments({ ...parsedFilter, location: req.user.location }); // Count total documents matching the filter

            return { purchases, totalDocuments };
        } catch (error) {
            log(`getting all purchases error ${error}`, "ERROR")
            throw new BadRequestException(error);
        }
    }

    async findOne(id: string): Promise<Purchase> {
        try {
            return this.purchaseModel.findById(id).exec();
        } catch (error) {
            log(`getting one purchases error ${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }

    async update(id: string, updatePurchaseDto: any) {
        try {
            Object.entries(updatePurchaseDto).forEach(([key, value]) => {
                log(`${key}: ${JSON.stringify(value)}`);
            });
            const product = await this.productService.findOne(updatePurchaseDto.productId);
            product.quantity = product.quantity - Number(updatePurchaseDto.quantity);
            const purchace = await this.purchaseModel.findById(id);
            purchace.quantity = purchace.quantity - Number(updatePurchaseDto.quantity);
            delete updatePurchaseDto.productId;
            delete updatePurchaseDto._id;
            purchace.damagedGoods.push(updatePurchaseDto) ;

            await product.save();
            await purchace.save();
        } catch (error) {
            log(`updating one purchases error ${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }

    async remove(id: string): Promise<Purchase> {
        try {
            return this.purchaseModel.findByIdAndDelete(id).exec();
        } catch (error) {
            log(`removeing one purchases error ${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }


    async editSoldQuantity(id: string, amount: number, price: number) {
        try {
            const purchase = await this.purchaseModel.findById(id)
            const productindex = purchase.sold.findIndex((item) => item.price == price)
            purchase.sold[productindex].amount -= amount
            if (purchase.sold[productindex].amount < 1) {
                purchase.sold.splice(productindex, 1)
            }
            await purchase.save();
            return purchase
        } catch (error) {
            log(`removeing updating sold purchases error ${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }


    async findFirstUnsoldPurchase(productId: string, req: any) {
        try {
            const purchase = await this.purchaseModel.findOne({
                productId: productId,
                $expr: { $lt: [{ $sum: "$sold.amount" }, "$quantity"] },
                location: req.user.location
            }).sort({ createdAt: 1 }).exec();

            return purchase;
        } catch (error) {
            log(`${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }
}

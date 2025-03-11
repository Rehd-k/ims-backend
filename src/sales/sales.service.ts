import { forwardRef, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryService } from 'src/product/inventory.service';
import { Sale } from './sales.schema';
import { QueryDto } from 'src/product/query.dto';
import { PurchasesService } from 'src/purchases/purchases.service';
import { FilterQuery } from 'mongoose';
import { CustomerService } from 'src/customer/customer.service';


@Injectable()
export class SalesService {
    logger = Logger;
    constructor(
        @Inject(forwardRef(() => InventoryService)) private inventoryService: InventoryService,
        @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
        private customerService: CustomerService,
        private purchaseService: PurchasesService
    ) { }

    async doSell(sellData: any, req: any): Promise<any> {
        let qunt_to_sell = 0;
        let profit = 0;
        for (const element of sellData.products) {

            qunt_to_sell = element.quantity
            element.breakdown = [];
            try {
                while (qunt_to_sell > 0) {
                    await handle_break_down(element, this.purchaseService);
                }
                for (const el of element.breakdown) {
                    profit = profit + el.total_profit
                }
            } catch (error) {
                console.log(error)
                throw new InternalServerErrorException(error)
            }
        }

        try {
            sellData.profit = profit;
            sellData.handler = req.user.username;
            sellData.totalAmount = sellData.cash + sellData.card + sellData.transfer
            const data = await this.saleModel.create(sellData);

            for (const element of data.products) {
                await this.inventoryService.deductStock(element._id, element.quantity)
            }
            if (sellData.customer && sellData.customer !== '') {
                await this.customerService.addOrder(sellData.customer, data._id, data.totalAmount)
            }
            
            return data
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException(error)
        }





        async function handle_break_down(element: any, purchaseService: PurchasesService) {
            const purchase = await purchaseService.findFirstUnsoldPurchase(element._id);
            const sold = purchase.sold.reduce((sum, item) => sum + (item.amount || 0), 0);
            const good_avalable_for_sale = purchase.quantity - sold;
            if (good_avalable_for_sale >= qunt_to_sell) {
                const breakdown = {
                    orderBatch: purchase._id,
                    quantity: qunt_to_sell,
                    costPrice: purchase.price,
                    profit: element.price - purchase.price,
                    total_profit: (element.price - purchase.price) * qunt_to_sell,
                };
                console.log(breakdown);
                element.breakdown.push(breakdown);
                purchase.sold.push({ amount: qunt_to_sell, price: element.price });
                qunt_to_sell = 0
                await purchase.save();
            } else {
                const breakdown = {
                    orderBatch: purchase._id,
                    quantity: good_avalable_for_sale,
                    costPrice: purchase.price,
                    profit: element.price - purchase.price,
                    total_profit: (element.price - purchase.price) * good_avalable_for_sale,
                };

                element.breakdown = element.breakdown.push(breakdown);
                purchase.sold.push({ amount: good_avalable_for_sale, price: element.price });
                qunt_to_sell = qunt_to_sell - good_avalable_for_sale
                await purchase.save();
            }
        }
    }

    async getSingleProductSaleData(prodictId: string, query: QueryDto) {
        const {
            filter = '{}',
            startDate, endDate
        } = query;
        const parsedFilter = JSON.parse(filter);

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        console.log(parsedFilter.sorter, prodictId)
        let groupBy;
        switch (parsedFilter.sorter) {
            case 'Today':
                groupBy = {
                    $hour: "$createdAt"
                };
                break;
            case 'This Week':
            case 'Last Week':
                groupBy = {
                    $dayOfWeek: "$createdAt"
                };
                break;
            case 'This Month':
            case 'Next Month':
                groupBy = {
                    $week: "$createdAt"
                };
                break;
            case 'Last 7 Days':
                groupBy = {
                    $dayOfYear: "$createdAt"
                };
                break;
            case 'Last Month':
                groupBy = {
                    $week: "$createdAt"
                };
                break;
            case 'First Quarter':
            case 'Second Quarter':
            case 'Third Quarter':
            case 'Fourth Quarter':
                groupBy = {
                    $quarter: "$createdAt"
                };
                break;
            case 'This Year':
                groupBy = {
                    $month: "$createdAt"
                };
                break;
            default:
                groupBy = {
                    $dayOfYear: "$createdAt"
                };
        }
        try {

            const sales = await this.saleModel.aggregate([
                { $unwind: "$products" },
                {
                    $match: {
                        "products._id": prodictId,
                        createdAt: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: groupBy,
                        totalQuantity: { $sum: "$products.quantity" },
                        // sales: { $push: "$$ROOT" }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);
            console.log(sales)
            return sales;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async doSearch(query: string): Promise<Sale[]> {
        const filterQuery: FilterQuery<Sale> = {};
        const searchQuery = { $text: { $search: query } };
        try {
            return await this.saleModel.find(searchQuery).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async findAll(query: QueryDto, req: any) {
        const {
            filter = '{}',
            sort = '{}',
            skip = 0,
            select = '',
            limit = 10
        } = query;
        const parsedFilter = JSON.parse(filter);
        const parsedSort = JSON.parse(sort);

        try {
            const startDate = new Date(query.startDate);
            startDate.setHours(0, 0, 0, 0); // Start of the startDate

            const endDate = new Date(query.endDate);
            endDate.setHours(23, 59, 59, 999); // End of the endDate 

            parsedFilter.transactionDate = { $gte: startDate, $lte: endDate };

            if (req.user.role === 'cashier') {
                parsedFilter.handler = req.user.username
            }

            if (req.user.role === 'staff') {
                parsedFilter.handler = req.user.username
            }


            const sales = await this.saleModel
                .find(parsedFilter)
                .sort(parsedSort)
                .skip(Number(skip))
                .limit(Number(limit))
                .select(select)
                .exec();

            const handlersSet = new Set<string>();
            sales.forEach(sale => handlersSet.add(sale.handler));
            const handlers = Array.from(handlersSet);

            return { sales, handlers };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error)
        }
    }

    async findOne(id: string): Promise<Sale> {
        try {
            return await this.saleModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async update(id: string, updateData: any): Promise<Sale> {

        try {
            const sale = await this.saleModel.findById(id)

            for (const key in updateData) {

                if (updateData.hasOwnProperty(key) && sale[key] !== undefined) {
                    sale[key] = updateData[key];
                }
            }
            return await sale.save()
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async return(id: string, data: any, req: any) {
        try {
            if (!data.handler) {
                for (const element of data.returns) {
                    element.handler = req.user.username
                }
            } else {
                for (const element of data.returns) {
                    element.handler = data.handler
                }
            }
            const sale = await this.saleModel.findOne({ _id: id })
            sale.returns = sale.returns.concat(data.returns)
            let returns = data.returns
            let cart = sale.products

            for (const returnItem of returns) {
                const productIndex = cart.findIndex(product => product._id.toString() === returnItem.productId.toString());
                if (productIndex !== -1) {

                    let qunt_to_remove = returnItem.quantity

                    while (qunt_to_remove > 0) {
                        let batch = returnItem.batches[0]
                        if (batch.quantity <= qunt_to_remove) {
                            await this.purchaseService.editSoldQuantity(batch.orderBatch, batch.quantity, cart[productIndex].price)
                            returnItem.batches.splice(0, 1)
                            qunt_to_remove -= batch.quantity
                        } else {
                            await this.purchaseService.editSoldQuantity(batch.orderBatch, qunt_to_remove, cart[productIndex].price)
                            returnItem.batches[0].quantity -= qunt_to_remove
                            returnItem.batches[0].total_profit = returnItem.batches[0].quantity * returnItem.batches[0].profit
                            qunt_to_remove = 0
                        }
                    }

                    cart[productIndex].breakdown = returnItem.batches
                    cart[productIndex].quantity -= returnItem.quantity;
                    cart[productIndex].total = cart[productIndex].quantity * cart[productIndex].price;
                    if (cart[productIndex].quantity < 1) {
                        cart.splice(productIndex, 1);
                    }
                }
            }
            sale.totalAmount = cart.reduce((acc, product) => acc + product.total, 0);
            let profit = 0;
            for (const element of sale.products) {
                for (const el of element.breakdown) {
                    profit = profit + el.total_profit
                }
            }

            sale.profit = profit


            await sale.save();
            for (const element of data.returns) {
                await this.inventoryService.restockProduct(element.productId, element.quantity)
            }
            return sale;
        } catch (e) {
            console.log(e)
        }
    }

    async delete(id: string): Promise<any> {
        try {
            return await this.saleModel.findByIdAndDelete(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async getDashboardData(id: string, startDate: Date, endDate: Date): Promise<{ totalAmount: number, totalPrice: number }[]> {
        if (!startDate) {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0); // Start of today
        }
        if (!endDate) {
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of today
        }
        const sales = await this.saleModel.aggregate([
            { $unwind: "$products" },
            {
                $match: {
                    "products._id": id,
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$products.quantity" },  // Sum of all amounts
                    totalPrice: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },

                    sales_by_date: {
                        $push: {
                            date: "$createdAt",
                            amount: "$products.quantity"
                        }
                    }
                }
            }
        ]);
        console.log(sales);
        return sales;
    }



}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from 'src/customer/customer.schema';
import { Expenses } from 'src/expense/expenses.schema';
import { Product } from 'src/product/product.schema';
import { Sale } from 'src/sales/sales.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Expenses.name) private readonly expenseModel: Model<Expenses>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>
  ) { }

  async getSalesDashboard(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailySales = await this.saleModel.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
    ]);

    const weeklySales = await this.saleModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
    ]);

    const monthlySales = await this.saleModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } },
    ]);

    return {
      dailySales: dailySales[0]?.totalSales || 0,
      weeklySales: weeklySales[0]?.totalSales || 0,
      monthlySales: monthlySales[0]?.totalSales || 0,
    };
  }

  async getRevenueReports(): Promise<any> {
    const transactions = await this.saleModel.find();
    let totalRevenue = 0;
    let totalCost = 0;

    for (const transaction of transactions) {
      totalRevenue += transaction.totalAmount;
      for (const item of transaction.products) {
        const product = await this.productModel.findById(item._id);
        totalCost += product.purchasePrice * item.quantity;
      }
    }

    const profit = totalRevenue - totalCost;
    return { totalRevenue, totalCost, profit };
  }

  async getInventoryReports(): Promise<any> {
    const products = await this.productModel.find();
    const lowStock = products.filter((product) => product.quantity < product.roq);

    return {
      currentStock: products.map((product) => ({
        name: product.title,
        quantity: product.quantity,
      })),
      lowStock,
      stockTurnoverRates: products.map((product) => ({
        name: product.title,
        turnoverRate: (product.sold || 0) / (product.quantity + (product.sold || 0)),
      })),
    };
  }

  async getTopSellingProducts(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const topSellingToday = await this.saleModel.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $unwind: '$products' },
      { $group: { _id: '$products._id', totalSold: { $sum: '$products.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { _id: 0, title: '$product.title', totalSold: 1 } },
    ]);

    const topSellingWeekly = await this.saleModel.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } },
      { $unwind: '$products' },
      { $group: { _id: '$products._id', totalSold: { $sum: '$products.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { _id: 0, title: '$product.title', totalSold: 1 } },
    ]);

    const topSellingMonthly = await this.saleModel.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } },
      { $unwind: '$products' },
      { $group: { _id: '$products._id', totalSold: { $sum: '$products.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { _id: 0, title: '$product.title', totalSold: 1 } },
    ]);

    return {
      topSellingToday,
      topSellingWeekly,
      topSellingMonthly,
    };
  }

  async getProfitAndLoss(startDate: Date, endDate: Date) {
    // Set start date to the start of the day
    startDate.setHours(0, 0, 0, 0);

    // Set end date to the end of the day
    endDate.setHours(23, 59, 59, 999);
    // Calculate total revenue
    const revenueResult = await this.saleModel.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Calculate total expenses
    const expensesResult = await this.expenseModel.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' } } },
    ]);
    const totalExpenses = expensesResult[0]?.totalExpenses || 0;

    // Calculate profit or loss
    const profitOrLoss = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      profitOrLoss,
    };
  }

  async getProductStatistics(): Promise<any> {
    const result = await this.productModel.aggregate([
      {
        $facet: {
          totalProducts: [{ $count: "count" }],
          totalQuantity: [{ $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }],
          totalValue: [{ $group: { _id: null, totalValue: { $sum: { $multiply: ["$quantity", "$price"] } } } }],
          lowStockCount: [{ $match: { $expr: { $lt: ["$quantity", "$roq"] } } }, { $count: "count" }],
          fastestMovingProduct: [{ $sort: { sold: -1 } }, { $limit: 1 }, { $project: { _id: 1, title: 1 } }],
          slowestMovingProduct: [{ $sort: { sold: 1 } }, { $limit: 1 }, { $project: { _id: 1, title: 1 } }],
          expiredProducts: [{ $match: { expiryDate: { $lt: new Date() } } }, { $count: "count" }]
        }
      },
      {
        $project: {
          totalProducts: { $arrayElemAt: ["$totalProducts.count", 0] },
          totalQuantity: { $arrayElemAt: ["$totalQuantity.totalQuantity", 0] },
          totalValue: { $arrayElemAt: ["$totalValue.totalValue", 0] },
          lowStockCount: { $arrayElemAt: ["$lowStockCount.count", 0] },
          fastestMovingProduct: { $arrayElemAt: ["$fastestMovingProduct", 0] },
          slowestMovingProduct: { $arrayElemAt: ["$slowestMovingProduct", 0] },
          expiredProducts: { $arrayElemAt: ["$expiredProducts.count", 0] }

        }
      }
    ]);

    return result[0];

  }

  async getCustomerStatistics(): Promise<any> {
    const result = await this.customerModel.aggregate([
      {
        $lookup: {
          from: "sales",
          localField: "orders",
          foreignField: "_id",
          as: "orderDetails",
        },
      },
      {
        $lookup: {
          from: "sales",
          localField: "returns",
          foreignField: "_id",
          as: "returnDetails",
        },
      },
      {
        $addFields: {
          lastPurchase: { $arrayElemAt: [{ $slice: ["$orderDetails", -1] }, 0] },
          orderCount: { $size: "$orders" },
        },
      },
      {
        $facet: {
          newestCustomers: [
            { $sort: { createdAt: -1 } },
            { $limit: 4 },
            {
              $project: {
                _id: 1,
                name: 1,
                lastPurchaseDate: "$lastPurchase.createdAt",
                lastPurchaseAmount: "$lastPurchase.totalAmount",
                total_spent: 1,
              },
            },
          ],
          mostFrequentCustomer: [
            { $sort: { orderCount: -1 } },
            { $limit: 4 },
            {
              $project: {
                _id: 1,
                name: 1,
                lastPurchaseDate: "$lastPurchase.createdAt",
                lastPurchaseAmount: "$lastPurchase.totalAmount",
                total_spent: 1,
              },
            },
          ],
          totalCustomers: [
            {
              $count: "totalCustomers",
            },
          ],
          retentionCurrentMonth: [
            {
              $match: {
                "lastPurchase.createdAt": {
                  $gte: new Date(new Date().setDate(1)), // First day of the month
                  $lt: new Date(), // Today
                },
              },
            },
            {
              $count: "customerRetention",
            },
          ],
        },
      },
    ]);
    return result[0];
  }



  /**
   * THIS IS FOR getProductStatistics INCASE I GAIN MY MIND
   * 
   *    const totalProducts = await this.productModel.countDocuments();

    const totalQuantityResult = await this.productModel.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ]);
    const totalQuantity = totalQuantityResult[0]?.totalQuantity || 0;

    const totalValueResult = await this.productModel.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$quantity', '$price'] } } } },
    ]);
    const totalValue = totalValueResult[0]?.totalValue || 0;

    const lowStockCount = await this.productModel.countDocuments({ $expr: { $lt: ["$quantity", "$roq"] } });

    const fastestMovingProductResult = await this.productModel.find().sort({ sold: -1 }).limit(1);
    const fastestMovingProduct = fastestMovingProductResult[0];

    const slowestMovingProductResult = await this.productModel.find().sort({ sold: 1 }).limit(1);
    const slowestMovingProduct = slowestMovingProductResult[0];

    const expiredProducts = await this.productModel.find({ expiryDate: { $lt: new Date() } });
    return {
      totalProducts,
      totalQuantity,
      totalValue,
      lowStockCount,
      fastestMovingProduct,
      slowestMovingProduct,
      expiredProducts,
    };
   */
}

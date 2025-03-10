import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expenses } from 'src/expense/expenses.schema';
import { Product } from 'src/product/product.schema';
import { Sale } from 'src/sales/sales.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Expenses.name) private readonly expenseModel: Model<Expenses>
  ) {}

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

  async getProfitAndLoss(startDate: Date, endDate: Date) {
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
}

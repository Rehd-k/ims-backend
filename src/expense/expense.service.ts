import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expenses } from './expenses.schema';

@Injectable()
export class ExpensesService {
    constructor(@InjectModel(Expenses.name) private readonly expenseModel: Model<Expenses>) { }

    async createExpense(category: string, description: string, amount: number, createdBy: string) {
        const expense = new this.expenseModel({ category, description, amount, createdBy });
        return await expense.save();
    }

    async getExpenses(startDate: Date, endDate: Date) {
        return await this.expenseModel.find({
            date: { $gte: startDate, $lte: endDate },
        }).sort({ date: -1 });
    }

    async getTotalExpenses(startDate: Date, endDate: Date) {
        const result = await this.expenseModel.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return result[0]?.total || 0;
    }
}

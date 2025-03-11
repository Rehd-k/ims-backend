import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expenses } from './expenses.schema';

@Injectable()
export class ExpensesService {
    constructor(@InjectModel(Expenses.name) private readonly expenseModel: Model<Expenses>) { }


    async createExpense(body, req) {

        body.createdBy = req.user.username
        return await this.expenseModel.create(body);

    }

    async updateExpense(id: string, updateData: Partial<Expenses>) {
        console.log(updateData)
        const expense = await this.expenseModel.findById(id);
        for (const key in updateData) {
            if (updateData.hasOwnProperty(key)) {
                expense[key] = updateData[key];
            }
        }
        return await expense.save();
    }

    async deleteExpense(id: string) {
        console.log(id);
        return await this.expenseModel.findByIdAndDelete(id);
    }

    async getExpenses(startDate: Date, endDate: Date) {
        return await this.expenseModel.find().sort({ date: -1 });
    }

    async getTotalExpenses(startDate: Date, endDate: Date) {
        const result = await this.expenseModel.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return result[0]?.total || 0;
    }
}

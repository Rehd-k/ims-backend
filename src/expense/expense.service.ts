import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expenses } from './expenses.schema';
import { QueryDto } from 'src/product/query.dto';

@Injectable()
export class ExpensesService {
    constructor(@InjectModel(Expenses.name) private readonly expenseModel: Model<Expenses>) { }


    async createExpense(body: any, req: any) {

        body.createdBy = req.user.username
        body.location = req.user.location;
        return await this.expenseModel.create(body);

    }

    async updateExpense(id: string, updateData: Partial<Expenses>) {

        const expense = await this.expenseModel.findById(id);
        for (const key in updateData) {
            if (updateData.hasOwnProperty(key)) {
                expense[key] = updateData[key];
            }
        }
        return await expense.save();
    }

    async deleteExpense(id: string) {

        return await this.expenseModel.findByIdAndDelete(id);
    }

    async getExpenses(query: QueryDto, req: any) {
        const {
            filter = '{}',
            sort = '{}',
            skip = 0,
            select = '',
            limit = 10,
            startDate,
            endDate
        } = query;
        const parsedFilter = JSON.parse(filter);
        const parsedSort = JSON.parse(sort);



        try {
            // const start = new Date(startDate);
            // start.setHours(0, 0, 0, 0); 

            // const end = new Date(endDate);
            // end.setHours(23, 59, 59, 999);

            // parsedFilter.createdAt = { $gte: start, $lte: end };

            return await this.expenseModel.find({...parsedFilter, location: req.user.location })
                .sort(parsedSort)
                .skip(Number(skip))
                .limit(Number(limit))
                .select(select)
                .exec()
        } catch (error) { }
    }

    async getTotalExpenses(query: QueryDto, req: any) {

        const {
            filter = '{}',
            sort = '{}',
            skip = 0,
            select = '',
            limit = 10,
            startDate,
            endDate
        } = query;
        const parsedFilter = JSON.parse(filter);
        const parsedSort = JSON.parse(sort);

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Start of the startDate

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const result = await this.expenseModel.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, ...parsedFilter, location: req.user.location } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return result[0]?.total || 0;
    }
}

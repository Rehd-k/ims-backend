import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expenses } from './expenses.schema';
import { QueryDto } from 'src/product/query.dto';
import { log } from 'src/do_logger';

@Injectable()
export class ExpensesService {
    constructor(@InjectModel(Expenses.name) private readonly expenseModel: Model<Expenses>) { }


    async createExpense(body: any, req: any) {
        try {
            body.createdBy = req.user.username
            body.location = req.user.location;
            return await this.expenseModel.create(body);
        } catch (error) {
            log(`error creating expenses ${error}`, "ERROR")
            throw new BadRequestException(error);
        }


    }

    async updateExpense(id: string, updateData: Partial<Expenses>) {
        try {
            const expense = await this.expenseModel.findById(id);
            for (const key in updateData) {
                if (updateData.hasOwnProperty(key)) {
                    expense[key] = updateData[key];
                }
            }
            return await expense.save();
        } catch (error) {
            log(`error updating expenses ${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }

    async deleteExpense(id: string) {
        try {
            return await this.expenseModel.findByIdAndDelete(id);
        } catch (error) {
            log(`error deleting expenses ${error}`, "ERROR")
            throw new BadRequestException(error);
        }

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
            // end.setHours(24, 59, 59, 999);

            // parsedFilter.createdAt = { $gte: start, $lte: end };

            return await this.expenseModel.find({ ...parsedFilter, location: req.user.location })
                .sort(parsedSort)
                .skip(Number(skip))
                .limit(Number(limit))
                .select(select)
                .exec()
        } catch (error) {
            log(`error reading all expenses ${error}`, "ERROR")
            throw new BadRequestException(error);
        }
    }

    async getTotalExpenses(query: QueryDto, req: any) {
        try {
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
            end.setHours(24, 59, 59, 999);
            const result = await this.expenseModel.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end }, ...parsedFilter, location: req.user.location } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]);
            return result[0]?.total || 0;
        } catch (error) {
            log(`error getting  total expenses ${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }
}

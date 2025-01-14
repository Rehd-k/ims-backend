import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ExpensesService } from './expense.service';

@Controller('expenses')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    async createExpense(@Body() body: any) {
        const { category, description, amount, createdBy } = body;
        return this.expensesService.createExpense(category, description, amount, createdBy);
    }

    @Get()
    async getExpenses(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return this.expensesService.getExpenses(new Date(startDate), new Date(endDate));
    }

    @Get('/total')
    async getTotalExpenses(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return this.expensesService.getTotalExpenses(new Date(startDate), new Date(endDate));
    }
}

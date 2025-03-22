import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expense.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Roles } from 'src/helpers/role/roles.decorator';
import { Role } from 'src/helpers/enums';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expense')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }


    @Roles(Role.God, Role.Admin, Role.Manager)
    @Post()
    async createExpense(@Body() body: any, @Req() req: any) {
        try {
            return this.expensesService.createExpense(body, req);
        } catch (error) {
        }

    }

    @Put('/update/:id')
    async updateExpense(@Param('id') id: string, @Body() body: any) {
        return this.expensesService.updateExpense(id, body);
    }

    @Delete('/delete/:id')
    async deleteExpense(@Param('id') id: string) {
        return this.expensesService.deleteExpense(id);
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

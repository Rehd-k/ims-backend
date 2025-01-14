import { Module } from '@nestjs/common';
import { ExpensesService } from './expense.service';
import { ExpensesController } from './expense.controller';

@Module({
  providers: [ExpensesService],
  controllers: [ExpensesController]
})
export class ExpenseModule {}

import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('/sales-dashboard')
    async getSalesDashboard() {
        return this.analyticsService.getSalesDashboard();
    }

    @Get('/revenue-reports')
    async getRevenueReports() {
        return this.analyticsService.getRevenueReports();
    }

    @Get('/inventory-reports')
    async getInventoryReports() {
        return this.analyticsService.getInventoryReports();
    }

    @Get('/profit-and-loss')
    async getProfitAndLoss(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
      return this.analyticsService.getProfitAndLoss(new Date(startDate), new Date(endDate));
    }

}

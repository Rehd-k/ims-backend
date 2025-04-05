import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Roles } from 'src/helpers/role/roles.decorator';
import { Role } from 'src/helpers/enums';
import { QueryDto } from 'src/product/query.dto';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Roles(Role.God, Role.Admin)
    @Get('/sales-dashboard')
    async getSalesDashboard() {
        return this.analyticsService.getSalesDashboard();
    }

    @Roles(Role.God, Role.Admin)
    @Get('/revenue-reports')
    async getRevenueReports() {
        return this.analyticsService.getRevenueReports();
    }

    @Roles(Role.God, Role.Admin)
    @Get('/inventory-reports')
    async getInventoryReports() {
        return this.analyticsService.getInventoryReports();
    }

    @Roles(Role.God, Role.Admin)
    @Get('/profit-and-loss')
    async getProfitAndLoss(@Query() query: QueryDto) {
        return this.analyticsService.getProfitAndLoss(query);
    }

    @Roles(Role.God, Role.Admin)
    @Get('/get-best-selling-products')
    async getBestSellingProducts() {
        return this.analyticsService.getTopSellingProducts();
    }

    @Roles(Role.God, Role.Admin)
    @Get('/inventory-summary')
    async inventorySummary() {
        return this.analyticsService.getProductStatistics();
    }

    @Roles(Role.God, Role.Admin)
    @Get('/customer-summary')
    async customerSummary() {
        return this.analyticsService.getCustomerStatistics();
    }

    @Roles(Role.God, Role.Admin)
    @Get('/sales-data')
    async WeeklySalesData() {
        const data =  await this.analyticsService.getWeeklySalesData();
        console.log(data);
        return data;
    }

    @Roles(Role.God, Role.Admin)
    @Get('/get-sales-chart')
    async GetSalesData(
        @Query() query: QueryDto
    ) {
        const data =  await this.analyticsService.getSalesData(query.filter);
        console.log(data);
        return data;
    }
    
    




}

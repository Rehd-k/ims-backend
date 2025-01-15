import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Roles } from 'src/helpers/role/roles.decorator';
import { Role } from 'src/helpers/enums';


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
    async getProfitAndLoss(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return this.analyticsService.getProfitAndLoss(new Date(startDate), new Date(endDate));
    }

}

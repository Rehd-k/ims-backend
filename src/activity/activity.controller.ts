import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { QueryDto } from 'src/product/query.dto';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';



@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activity')
export class ActivityController {
    constructor(private readonly activityLogService: ActivityService) { }

    @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
    @Get()
    async getLogs(
        @Query() query: QueryDto,
        @Req() req: any
    ) {
        return this.activityLogService.getLogs(query, req);
    }
}

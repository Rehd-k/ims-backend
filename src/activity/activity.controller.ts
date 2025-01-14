import { Controller, Get } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
    constructor(private readonly activityLogService: ActivityService) { }

    @Get()
    async getLogs() {
        return this.activityLogService.getLogs();
    }
}

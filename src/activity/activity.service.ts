import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ActivityLog } from './activity.schema';
import { Model } from 'mongoose';



@Injectable()
export class ActivityService {
    constructor(@InjectModel('ActivityLog') private readonly activityLogModel: Model<ActivityLog>) { }

    async logAction(userId: string, username: string, action: string, details?: string) {
        const log = new this.activityLogModel({ userId, username, action, details });
        return await log.save();
    }

    async getLogs() {
        return await this.activityLogModel.find().sort({ createdAt: -1 });
    }
}

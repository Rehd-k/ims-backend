import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './notification.schema';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
    ) { }

    async createNotification(type: string, message: string, recipients: string[]) {
        const notification = new this.notificationModel({ type, message, recipients });
        return await notification.save();
    }

    // add getting notofications for a particular user
    async getNotifications(recipient: string) {
        return await this.notificationModel.find({ recipients: recipient }).sort({ createdAt: -1 });
    }

    async markAsRead(notificationId: string) {
        return await this.notificationModel.findByIdAndUpdate(notificationId, { isRead: true });
    }
}

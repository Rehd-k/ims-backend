import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async createNotification(@Body() body: any) {
    const { type, message, recipients } = body;
    return this.notificationsService.createNotification(type, message, recipients);
  }

  @Get(':recipient')
  async getNotifications(@Param('recipient') recipient: string) {
    return this.notificationsService.getNotifications(recipient);
  }

  @Patch(':id/mark-read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}

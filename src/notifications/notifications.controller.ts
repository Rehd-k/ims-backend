import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
  @Post()
  async createNotification(@Body() body: any, @Req() req: any) {
    const { type, message, recipients } = body;
    return this.notificationsService.createNotification(type, message, recipients, req);
  }


  @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
  @Get(':recipient')
  async getNotifications(@Param('recipient') recipient: string, @Req() req: any) {
    return this.notificationsService.getNotifications(recipient, req.user.location);
  }

  @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
  @Patch(':id/mark-read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}

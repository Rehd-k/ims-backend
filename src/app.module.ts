import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { SalesModule } from './sales/sales.module';
import { SupplierModule } from './supplier/supplier.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ActivityModule } from './activity/activity.module';
import { ExpenseModule } from './expense/expense.module';
import { LocationModule } from './location/location.module';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/ims'), UserModule, AuthModule, ProductModule, SalesModule, SupplierModule, AnalyticsModule, NotificationsModule, ActivityModule, ExpenseModule, LocationModule, PurchasesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';

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
import { CategoryModule } from './category/category.module';
import 'pino-pretty';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/ims'),
    UserModule,
    AuthModule,
    ProductModule,
    SalesModule,
    SupplierModule,
    AnalyticsModule,
    NotificationsModule,
    ActivityModule,
    ExpenseModule,
    LocationModule,
    PurchasesModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info', // Set log level
        transport: process.env.NODE_ENV !== 'production' ? {
          target: 'pino-pretty',
          options: {
            
            colorize: true,
            translateTime: 'HH:MM:ss',
          },
        } : undefined, // Pretty logs in development
      },
    }),
    CategoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

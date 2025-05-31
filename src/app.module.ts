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
import { CustomerModule } from './customer/customer.module';
import { BanksModule } from './banks/banks.module';
import 'pino-pretty';
import { ConfigModule } from '@nestjs/config';
import { TodoModule } from './todo/todo.module';
import { InvoiceModule } from './invoice/invoice.module';
import { SettingsModule } from './settings/settings.module';
import { ChargesModule } from './charges/charges.module';
import * as fs from 'fs';
import { log } from './do_logger';


// Ensure logs directory exists
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri = 'mongodb://127.0.0.1:27017/ims';
        return {
          uri,
          connectionFactory: (connection) => {
            connection.once('open', () => {
              log('DB started');
            });
            return connection;
          },
        };
      },
    }),
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
        level: 'info',
        stream: fs.createWriteStream('./logs/app.log', { flags: 'a' }), // Log only to file
      },
    }),
    CategoryModule,
    CustomerModule,
    BanksModule,
    TodoModule,
    InvoiceModule,
    SettingsModule,
    ChargesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

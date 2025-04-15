import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';
import { Bank, BankSchema } from './banks.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }]),
    ActivityModule
  ],
  providers: [BanksService],
  controllers: [BanksController]
})
export class BanksModule { }

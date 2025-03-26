import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';
import { Bank, BankSchema } from './banks.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }]),
  ],
  providers: [BanksService],
  controllers: [BanksController]
})
export class BanksModule { }

import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogSchema } from './activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: ActivityLogSchema }])
  ],
  controllers: [ActivityController],
  providers: [ActivityService]
})
export class ActivityModule { }

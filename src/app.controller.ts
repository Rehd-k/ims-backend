import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MongoBackupService } from './mongo-backup.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private backUpService: MongoBackupService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  @Get('/do-backup')
  async doBackUp()  {
   await this.backUpService.scheduleBackup();
  }
}

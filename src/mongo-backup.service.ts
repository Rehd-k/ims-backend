// src/backup/backup.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mongoose from 'mongoose';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as archiver from 'archiver';
import * as cron from 'node-cron';

@Injectable()
export class MongoBackupService implements OnModuleInit {
  private mongoUri = 'mongodb://localhost:27017/ims'; // Update this

  async onModuleInit() {
    await mongoose.connect(this.mongoUri);
    this.scheduleBackup();
  }

  scheduleBackup() {
    // Every 4 hours: 0 */4 * * *
    cron.schedule('0 */4 * * *', () => {
      this.performBackup().catch(console.error);
    });

    // Run once on startup
    this.performBackup().catch(console.error);
  }

  async performBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folderName = `backup_${timestamp}`;
    const backupDir = path.join('./backups');
    const tempFolder = path.join(backupDir, folderName);
    const zipPath = path.join(backupDir, `${folderName}.zip`);

    // Clear previous backups
    await fs.remove(backupDir);
    await fs.ensureDir(tempFolder);

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    for (const { name } of collections) {
      const data = await mongoose.connection.db
        .collection(name)
        .find({})
        .toArray();

       

      await fs.writeJson(path.join(tempFolder, `${name}.json`), data, {
        spaces: 2,
      });
    }

    await this.zipFolder(tempFolder, zipPath);
    await fs.remove(tempFolder); // Delete unzipped folder
  }

  async zipFolder(source: string, out: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(out);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(source, false);
      archive.finalize();
    });
  }
}

// src/whatsapp/whatsapp.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class WhatsappService implements OnModuleInit {
    private client: Client;

    onModuleInit() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: { headless: true },
        });

        this.client.on('qr', (qr) => {
            console.log('Scan this QR with WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('✅ WhatsApp client is ready!');
        });

        this.client.initialize();
    }

    async sendMessage(number: string, message: any) {

        await this.client.sendMessage(number, message);
    }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification extends Document {
    @Prop({ type: String, required: true })
    type: string; // e.g., "LowStock", "SalesAlert", "Promotion", 'General'

    @Prop({ type: String, required: true, set: (title: string) => title.toLowerCase() })
    message: string;

    @Prop({ type: [String], required: true })
    recipients: string[]; // e.g., Admins, Customers, Suppliers

    @Prop({ type: [String] })
    isRead: string[];

    @Prop({ required: true })
    location: string
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BankDocument = Bank & Document;

@Schema({ timestamps: true })
export class Bank {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    accountNumber: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: 0 })
    balance: number;

    @Prop({
        type: String,
        trim: true
    })
    initiator: string;

    @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
    location: Types.ObjectId;
}

export const BankSchema = SchemaFactory.createForClass(Bank);
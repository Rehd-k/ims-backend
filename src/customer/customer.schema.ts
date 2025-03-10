import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    email: string;

    @Prop()
    phone_number: string;

    @Prop()
    address: string;

    @Prop()
    total_spent: string;

    @Prop()
    total_returns: string;

    @Prop()
    tootal_refund: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], ref: 'Sale' })
    orders: Types.ObjectId[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], ref: 'Sale' })
    returns: Types.ObjectId[];

    @Prop({ required: true })
    initiator: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({
    timestamps: {
        currentTime: () => {
            // Create a date in GMT+1 (Central European Time)
            const now = new Date();
            // Get UTC time and add 1 hour (3600000 ms)
            return new Date(now.getTime() + 60 * 60 * 1000);
        }
    }
})
export class Customer extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    email: string;

    @Prop({ required: true, unique: true })
    phone_number: string;

    @Prop()
    address: string;

    @Prop({
        default: 0
    })
    total_spent: number;

    @Prop({
        default: 0
    })
    total_returns: number;

    @Prop({
        default: 0
    })
    tootal_refund: number;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], ref: 'Sale' })
    orders: Types.ObjectId[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], ref: 'Sale' })
    returns: Types.ObjectId[];

    @Prop()
    location: string;

    @Prop({ required: true })
    initiator: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Supplier extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    contact: string;

    @Prop()
    email: string;

    @Prop()
    address: string;

    @Prop([
        {
            orderDate: { type: Date, required: true, default: Date.now },
            items: [
                {
                    product: { type: Types.ObjectId, ref: 'Product', required: true },
                    quantity: { type: Number, required: true },
                    price: { type: Number, required: true },
                },
            ],
            totalCost: { type: Number, required: true },
            status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
        },
    ])
    orders: {
        orderDate: Date;
        items: {
            product: Types.ObjectId;
            quantity: number;
            price: number;
        }[];
        totalCost: number;
        status: string;
    }[];

    @Prop([
        {
            date: { type: Date, required: true, default: Date.now },
            amount: { type: Number, required: true },
            paymentMethod: { type: String, enum: ['Cash', 'Card', 'Transfer'], required: true },
        },
    ])
    payments: {
        date: Date;
        amount: number;
        paymentMethod: string;
    }[];

    @Prop({ required: true, default: 0 })
    outstandingBalance: number;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

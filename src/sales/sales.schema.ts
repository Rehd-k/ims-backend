import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { User } from 'src/user/user.schema';

export type SaleDocument = Sale & Document;

class CartProduct {
    prodId: string;
    title: string;
    amount: number;
    price: number;
    tootalPrice: number
}

@Schema({ timestamps: true })
export class Sale {
    @Prop({ type: [{ type: CartProduct }] })
    products: CartProduct[];

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    handler: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true, enum: ['Cash', 'Card', 'Transfer', 'Mixed'] })
    paymentMethod: string;

    @Prop()
    cash: number;

    @Prop()
    card: number;

    @Prop()
    transfer: number;

    @Prop()
    accountNumber: string
    @Prop()
    accountName: string

}

export const SaleSchema = SchemaFactory.createForClass(Sale);
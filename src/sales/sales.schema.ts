import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Product } from 'src/product/product.schema';
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
    product: CartProduct[];

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    handler: User;

    @Prop({ required: true, enum: ['Cash', 'Card', 'Transfer'] })
    paymentMethod: string;

    @Prop()
    bank: string

    @Prop()
    accountNumber: string

}

export const SaleSchema = SchemaFactory.createForClass(Sale);
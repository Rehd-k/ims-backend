import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type SaleDocument = Sale & Document;

function generateTransactionId(): string {
    return Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
}



@Schema()
class CartProduct {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    _id: Types.ObjectId;

    @Prop({
        set: (title: string) => title.toLowerCase()
    })
    title: string;

    @Prop()
    quantity: number;

    @Prop()
    price: number;

    @Prop([
        {
            quantity: Number,
            costPrice: Number,
            profit: Number,
            total_profit: Number,
            orderBatch: String
        },
    ])
    breakdown: Array<{ quantity: number; costPrice: number; profit: number, total_profit: number, orderBatch: string }>;


    @Prop()
    total: number;
}
const CartProductSchema = SchemaFactory.createForClass(CartProduct);

@Schema()
class Returns {
    @Prop()
    productId: string;

    @Prop({
        set: (title: string) => title.toLowerCase()
    })
    title: string;

    @Prop()
    quantity: number;

    @Prop()
    price: number;

    @Prop()
    total: number;

    @Prop(
        {
            set: (title: string) => title.toLowerCase()
        }
    )
    handler: string;

    @Prop({ default: Date.now })
    returnedAt: Date;
}

const ReturnsSchema = SchemaFactory.createForClass(Returns);

@Schema({ timestamps: true })

export class Sale {
    @Prop({ type: [CartProductSchema] })
    products: CartProduct[];

    @Prop({ default: generateTransactionId, index: 'text', set: (transactionId: string) => transactionId.toLowerCase(), })
    transactionId: string;

    @Prop({ required: true })
    totalAmount: number;

    @Prop({
        set: (title: string) => title.toLowerCase(), index: 'text'
    })
    handler: string;

    @Prop({ required: true, enum: ['cash', 'card', 'transfer', 'mixed'] })
    paymentMethod: string;

    @Prop()
    cash: number;

    @Prop()
    card: number;

    @Prop()
    transfer: number;

    @Prop()
    discount: number;

    @Prop()
    profit: number;

    @Prop({ type: Types.ObjectId, ref: 'Bank', required: true })
    bank: Types.ObjectId;


    @Prop({ type: [ReturnsSchema] })
    returns: Returns[]

    @Prop({ default: Date.now() })
    transactionDate: Date;

    @Prop({ required: true })
    location: string;

}

export const SaleSchema = SchemaFactory.createForClass(Sale);
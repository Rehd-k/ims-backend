import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

@Schema({ timestamps: true })
export class Purchase {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;


    @Prop({ required: true })
    user: string;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    total: number;

    @Prop({ required: true })
    purchaseDate: Date;

    @Prop()
    status: string;

    @Prop()
    paymentMethod: string;

    @Prop()
    shippingAddress: string;

    @Prop()
    billingAddress: string;

    @Prop()
    notes: string;

    @Prop()
    supplier: string;

    @Prop()
    expiryDate : string;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
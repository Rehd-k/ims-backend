import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Types } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

@Schema({ timestamps: true })
export class Purchase {

    @Prop({ required: true, set: (title: string) => title.toLowerCase() })
    initiator: string;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    total: number;

    @Prop({ required: true })
    totalPayable: number;

    @Prop({ required: true })
    purchaseDate: Date;

    @Prop({
        set: (title: string) => title.toLowerCase()
    })
    status: string;

    @Prop()
    paymentMethod: string;

    @Prop({
        set: (title: string) => title.toLowerCase()
    })
    shippingAddress: string;

    @Prop({
        set: (title: string) => title.toLowerCase()
    })
    notes: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' })
    supplier: Types.ObjectId;

    @Prop({
        default: Date.now()
    })
    expiryDate: Date;

    @Prop()
    transfer: number;

    @Prop()
    cash: number;

    @Prop()
    card: number

    @Prop()
    debt: number;

    @Prop()
    discount: number;

    @Prop()
    deliveryDate: Date;

    @Prop({
        type: [
            {
                date: { type: Date, required: true, default: Date.now },
                amountPaid: { type: { transfer: Number, cash: Number, card: Number }, required: true },
            },
        ]
    })
    outStandingPayments: {
        date: Date;
        amountPaid: { transfer: number, cash: number, card: number };
    }[];
    @Prop({
        type: [{
            _id: Types.ObjectId,
            date: Date,
            quantity: Number,
            reason: String,
        }]
    })
    damagedGoods: {
        _id: Types.ObjectId;
        date: Date;
        quantity: number;
        reason: string;
    }[];

    @Prop({
        type: [{
            amount: Number,
            price: Number
        }]
    })
    sold: {
        amount: number;
        price: number;

    }[]

    @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
    location: Types.ObjectId;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;


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

    @Prop()
    total: number;
}
const CartProductSchema = SchemaFactory.createForClass(CartProduct);

@Schema({ timestamps: true })
export class Invoice extends Document {


    @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
    customer: Types.ObjectId;

    @Prop({ required: true, type: Date })
    issuedDate: Date;

    @Prop({ required: true, type: Date })
    dueDate: Date;

    @Prop({ required: true, unique: true })
    invoiceNumber: string;

    @Prop({ required: true, type: String, default: '' })
    recurring: string;


    @Prop({ type: [CartProduct] })
    items: CartProduct[];

    @Prop({ required: true, type: Number })
    discount: number;

    @Prop({ required: true, type: Number })
    totalAmount: number;

    @Prop({ required: true, type: Number })
    tax: number;

    @Prop({ required: true, type: Number })
    previouslyPaidAmount: number;

    @Prop({ default: 'pending' })
    status: string;

    @Prop({ default: '' })
    transactionId: string;

    @Prop({ type: Types.ObjectId, ref: 'Bank', required: true })
    bank: Types.ObjectId;

    @Prop()
    note: string;

    @Prop()
    amountPaid: string;

    @Prop({ required: true, type: String })
    initiator: string;

    @Prop({ required: true, type: String })
    location: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
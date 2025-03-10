import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Purchase } from 'src/purchases/purchases.schema';

export type ProductDocument = Product & Document;

function generateTransactionId(): string {
    return Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
}

@Schema({ timestamps: true })
export class Product extends Document {
    @Prop({ required: true, trim: true, set: (title: string) => title.toLowerCase() })
    title: string;

    @Prop({ required: true, trim: true, set: (title: string) => title.toLowerCase() })
    category: string;

    @Prop({ min: 0, default: 0 })
    purchasePrice: number;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], ref: 'Purchase' })
    purchases: mongoose.Schema.Types.ObjectId[];

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], ref: 'Transfers' })
    transfers: mongoose.Schema.Types.ObjectId[];

    @Prop({ min: 0, default: 0 })
    roq: number

    @Prop({ min: 0, default: 0 })
    quantity: number;

    @Prop({ trim: true })
    description: string;

    @Prop({ trim: true, set: (title: string) => title.toLowerCase() })
    brand: string;

    @Prop({ trim: true, set: (title: string) => title.toLowerCase() })
    supplier: string;

    @Prop()
    expiryDate: Date;

    @Prop({ min: 0, default: 0 })
    weight: number;

    @Prop({ enum: ['kg', 'g', 'lb', 'oz', 'l', 'ml', 'unit'] })
    unit: string;

    @Prop({ default: generateTransactionId() })
    barcode: string;

    @Prop({ trim: true })
    imageUrl: string;

    @Prop({ default: false })
    isAvailable: boolean;

    @Prop({ default: 0 })
    sold: number;

    @Prop({ required: true, default: 0})
    initiator: String
}

export const ProductSchema = SchemaFactory.createForClass(Product);
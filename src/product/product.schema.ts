import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Purchase } from 'src/purchases/purchases.schema';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product extends Document {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ required: true, trim: true })
    category: string;

    @Prop({ min: 0, default: 0 })
    purchasePrice: number;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], ref: 'Purchase' })
    purchases: Purchase[];

    @Prop({ min: 0, default: 0 })
    roq: number

    @Prop({ min: 0, default: 0 })
    quantity: number;

    @Prop({ trim: true })
    description: string;

    @Prop({ trim: true })
    brand: string;

    @Prop({ trim: true })
    supplier: string;

    @Prop()
    expiryDate: Date;

    @Prop({ min: 0, default: 0 })
    weight: number;

    @Prop({ enum: ['kg', 'g', 'lb', 'oz', 'l', 'ml', 'unit'] })
    unit: string;

    @Prop({})
    barcode: string;

    @Prop({ trim: true })
    imageUrl: string;

    @Prop({ default: false })
    isAvailable: boolean;

    @Prop({ default: 0 })
    sold: number;

    @Prop({ required: true, default: 0 })
    initiator: String
}

export const ProductSchema = SchemaFactory.createForClass(Product);
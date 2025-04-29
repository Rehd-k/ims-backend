import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Purchase } from 'src/purchases/purchases.schema';

@Schema({ timestamps: true })
export class Supplier extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    email: string;

    @Prop()
    phone_number: string;

    @Prop()
    address: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], ref: 'Purchase' })
    orders: Types.ObjectId[];

    @Prop({ required: true })
    initiator: string;

    @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
    location: Types.ObjectId;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

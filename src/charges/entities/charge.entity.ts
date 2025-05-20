import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChargeDocument = Charge & Document;

@Schema({ timestamps: true })
export class Charge extends Document {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
    location: Types.ObjectId;

    @Prop()
    initiator: string;
}

export const ChargeSchema = SchemaFactory.createForClass(Charge);

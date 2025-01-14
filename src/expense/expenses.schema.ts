
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpensesDocument = Expenses & Document;

@Schema()
export class Expenses extends Document {
    @Prop({ type: String, required: true })
    category: string;

    @Prop({ type: String })
    description: string;

    @Prop({ type: Number, required: true })
    amount: number;

    @Prop({ type: Date, default: Date.now })
    date: Date;

    @Prop({ type: String, required: true })
    createdBy: string;
}

export const ExpensesSchema = SchemaFactory.createForClass(Expenses);

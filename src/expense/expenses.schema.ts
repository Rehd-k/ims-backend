
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpensesDocument = Expenses & Document;

@Schema()
export class Expenses extends Document {
    @Prop({ type: String, required: true, set: (title: string) => title.toLowerCase() })
    category: string;

    @Prop({ type: String, set: (title: string) => title.toLowerCase() })
    description: string;

    @Prop({ type: Number, required: true })
    amount: number;

    @Prop({ type: Date, default: Date.now })
    date: Date;

    @Prop({ type: String, required: true, set: (title: string) => title.toLowerCase() })
    createdBy: string;
}

export const ExpensesSchema = SchemaFactory.createForClass(Expenses);

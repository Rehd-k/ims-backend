import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true })
export class Todo extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    from: string;

    @Prop()
    for: string;

    @Prop({ 
        type: Date, 
        default: () => {
            const now = new Date();
            now.setHours(23, 59, 59, 999); // Set to the end of the day
            return now;
        } 
    })
    maxDate: Date;

    @Prop({ default: false })
    isCompleted: boolean;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);

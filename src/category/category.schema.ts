import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
    timestamps: true
})
export class Category extends Document {

    @Prop({
        type: String,
        required: true,
        unique: true,
        trim: true,
        set: (title: string) => title.toLowerCase()
    })
    title: string;

    @Prop({
        type: String,
        trim: true,
        set: (title: string) => title.toLowerCase()
    })
    description: string;

    @Prop({
        type: String,
        trim: true
    })
    user: string;

    @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
    location: Types.ObjectId;
};

export const CategorySchema = SchemaFactory.createForClass(Category);


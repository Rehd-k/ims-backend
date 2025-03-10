import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
    title: String;

    @Prop({
        type: String,
        trim: true,
        set: (title: string) => title.toLowerCase()
    })
    description: String;

    @Prop({
        type: String,
        trim: true
    })
    user: String;

};

export const CategorySchema = SchemaFactory.createForClass(Category);


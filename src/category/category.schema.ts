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
    })
    title: String;

    @Prop({
        type: String,
        trim: true
    })
    description: String;

    @Prop({
        type: String,
        trim: true
    })
    user: String;

};

export const CategorySchema = SchemaFactory.createForClass(Category);


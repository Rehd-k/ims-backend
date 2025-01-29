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
    name: String;

    @Prop({
        type: String,
        trim: true
    })
    description: String;

};

export const CategorySchema = SchemaFactory.createForClass(Category);


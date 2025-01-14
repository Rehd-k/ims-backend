import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    location: string;

    @Prop()
    manager: string;

    @Prop()
    contact: string;

    @Prop()
    email: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    openingHours: string;

    @Prop()
    closingHours: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location extends Document {
    @Prop({ required: true, set: (title: string) => title.toLowerCase() })
    name: string;

    @Prop({ required: true, set: (title: string) => title.toLowerCase() })
    location: string;

    @Prop({
        set: (title: string) => title.toLowerCase()
    })
    manager: string;

    @Prop({
        set: (title: string) => title.toLowerCase()
    })
    contact: string;

    @Prop({
        set: (title: string) => title.toLowerCase()
    })
    email: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    openingHours: string;

    @Prop()
    closingHours: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

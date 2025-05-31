import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location extends Document {
    @Prop({ required: true, set: (title: string) => title.toLowerCase() })
    firm_name: string;

    @Prop({ required: true, set: (title: string) => title.toLowerCase() })
    name: string;

    @Prop({ required: true, set: (title: string) => title.toLowerCase() })
    location: string;

    @Prop({ type: String, required: true })
    manager: string;

    @Prop()
    openingHours: string;

    @Prop()
    closingHours: string;

    @Prop()
    initiator: string;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

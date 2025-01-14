import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Location } from './location.schema';
import { Model } from 'mongoose';

@Injectable()
export class LocationService {
    constructor(@InjectModel(Location.name) private readonly locationModel: Model<Location>) { }

    async createStore(name: string, location: string, manager: string, contact: string) {
        const store = new this.locationModel({ name, location, manager, contact });
        return await store.save();
    }

    async getStores() {
        return await this.locationModel.find();
    }

    async getStoreById(storeId: string) {
        return await this.locationModel.findById(storeId);
    }

    async update(id: string, updateProductDto: any): Promise<Location> {
        try {
            return await this.locationModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async remove(id: string): Promise<Location> {
        try {
            return await this.locationModel.findByIdAndDelete(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

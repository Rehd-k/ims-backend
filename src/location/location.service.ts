import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Location } from './location.schema';
import { Model } from 'mongoose';
import { QueryDto } from 'src/product/query.dto';

@Injectable()
export class LocationService {
    constructor(@InjectModel(Location.name) private readonly locationModel: Model<Location>) { }

    async createStore(name: string, location: string, manager: string, contact: string, req: any) {
        const store = new this.locationModel({ name, location, manager, contact, initiator: req.user.username });
        return await store.save();
    }

    async getStores(query: QueryDto) {
        const {
            filter = '{}',
            sort = '{}',
            skip = 0,
            select = '',
            limit = 10,
            startDate,
            endDate,
            selectedDateField
        } = query;

        const parsedFilter = JSON.parse(filter);
        const parsedSort = JSON.parse(sort);
        return await this.locationModel.find(parsedFilter)
            .sort(parsedSort)
            .skip(Number(skip))
            .limit(Number(limit))
            .select(select)
            .exec();
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

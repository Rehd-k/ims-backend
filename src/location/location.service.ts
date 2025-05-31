import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Location } from './location.schema';
import { Model } from 'mongoose';
import { QueryDto } from 'src/product/query.dto';
import { log } from 'src/do_logger';

@Injectable()
export class LocationService {
    constructor(@InjectModel(Location.name) private readonly locationModel: Model<Location>) { }

    async createStore(name: string, location: string, manager: string, contact: string, req: any) {
        try {
            const store = new this.locationModel({ name, location, manager, contact, initiator: req.user.username });
            return await store.save();
        } catch (error) {
            log(`Error creating one store: ${error}`, "ERROR")
            throw new Error(`Error creating one store: ${error.message}`);
        }

    }

    async getStores(query: QueryDto) {
        try {
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
        } catch (error) {
            log(`Error getting all store: ${error}`, "ERROR")
            throw new Error(`Error getting all store: ${error.message}`);
        }

    }

    async getStoreById(storeId: string) {
        try {
            return await this.locationModel.findById(storeId);
        } catch (error) {
            log(`Error getting one store: ${error}`, "ERROR")
            throw new Error(`Error getting one store: ${error.message}`);
        }

    }

    async update(id: string, updateProductDto: any): Promise<Location> {
        try {
            return await this.locationModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
        } catch (error) {
            log(`Error updating one store: ${error}`, "ERROR")
            throw new BadRequestException(error);
        }
    }

    async remove(id: string): Promise<Location> {
        try {
            return await this.locationModel.findByIdAndDelete(id).exec();
        } catch (error) {
            log(`Error removing one store: ${error}`, "ERROR")
            throw new BadRequestException(error);
        }
    }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { QueryDto } from 'src/product/query.dto';


@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async create(user: any) {
        try {
            return await this.userModel.create(user);
        } catch (error) {
            if (error && error.code === 11000) {
                let errMessage = `User with username ${(error.errorResponse.keyValue.username)} already exists`;
                throw new InternalServerErrorException(errMessage);
            }
            if (error && error.name === "ValidationError")
                throw new InternalServerErrorException(error.message);
        }
    }

    async findOneByUsername(username: string, location?: string) {
        return this.userModel.findOne({ username, location });
    }

    async getAllUsers(query: QueryDto, req) {
        const {
            filter = '{}',
            sort = '{}',
            limit = 10,
            skip = 0,
            select = '',
        } = query;
        const parsedFilter = JSON.parse(filter);
        const parsedSort = JSON.parse(sort);
        return await this.userModel.find(parsedFilter)
            .sort(parsedSort)
            .skip(Number(skip))
            .limit(Number(limit))
            .select(select)
            .populate('location')
            .exec()
    }

    async getOneById(id: string) {
        return this.userModel.findById(id);
    }

    async updateOneById(id: string, user: Partial<User>) {
        return this.userModel.findByIdAndUpdate(id, user, { new: true });
    }

    async deleteOneById(id: string) {
        return this.userModel.findByIdAndDelete(id);
    }
}

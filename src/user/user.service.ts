import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { QueryDto } from 'src/product/query.dto';
import { log } from 'src/do_logger';


@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async create(user: any) {
        try {
            return await this.userModel.create(user);
        } catch (error) {
            if (error && error.code === 11000) {
                let errMessage = `User with username ${(error.errorResponse.keyValue.username)} already exists`;
                log(`${errMessage}`, "ERROR")
                throw new BadRequestException(errMessage);
            }
            if (error && error.name === "ValidationError")
                log(`ValidationError`, "ERROR")
            throw new InternalServerErrorException(error.message);
        }
    }

    async findOneByUsername(username: string, location?: string) {
        try {
            return this.userModel.findOne({ username, location });
        } catch (error) {
            log(`error finding user by username${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }

    async getAllUsers(query: QueryDto, req) {
        try {
            const {
                filter = '{}',
                sort = '{}',
                limit = 10,
                skip = 0,
                select = '',
            } = query;
            const parsedFilter = JSON.parse(filter);
            const parsedSort = JSON.parse(sort);
            return await this.userModel.find({...parsedFilter, location: req.user.location })
                .sort(parsedSort)
                .skip(Number(skip))
                .limit(Number(limit))
                .select(select)
                .populate('location')
                .exec()
        } catch (error) {
            log(`error finding all users ${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }

    async getOneById(id: string) {
        try {
            return this.userModel.findById(id);
        } catch (error) {
            log(`error finding one users ${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }

    async updateOneById(id: string, user: Partial<User>) {
        try {
            return this.userModel.findByIdAndUpdate(id, user, { new: true });
        } catch (error) {
            log(`error updating one users ${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }

    async deleteOneById(id: string) {
        try {
            return this.userModel.findByIdAndDelete(id);
        } catch (error) {
            log(`error deleting one users ${error}`, "ERROR")
            throw new BadRequestException(error);
        }

    }
}

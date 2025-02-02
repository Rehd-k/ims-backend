import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Category } from './category.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { QueryDto } from 'src/product/query.dto';

@Injectable()
export class CategoryService {
    constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) { }

    async createCategory(category) {
        return await this.categoryModel.create(category);

    }

    async getCategorys(query: QueryDto) {
        const {
            filter = '{}',
            sort = '{}',
            limit = 10,
            skip = 0,
            select = '',
        } = query;
        const parsedFilter = JSON.parse(filter);
        const parsedSort = JSON.parse(sort);
        return await this.categoryModel.find(parsedFilter)
            .sort(parsedSort)
            .skip(Number(skip))
            .limit(Number(limit))
            .select(select)
            .exec()
    }

    async getCategoryById(CategoryId: string) {
        return await this.categoryModel.findById(CategoryId);
    }

    async update(id: string, updateProductDto: any): Promise<Category> {
        try {
            return await this.categoryModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async remove(id: string): Promise<Category> {
        try {
            return await this.categoryModel.findByIdAndDelete(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

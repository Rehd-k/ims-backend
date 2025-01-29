import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Category } from './category.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CategoryService {
    constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) { }

     async createCategory(category) {
        return await this.categoryModel.create(category);
              
        }
    
        async getCategorys() {
            return await this.categoryModel.find();
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

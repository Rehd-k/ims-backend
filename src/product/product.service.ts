import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';

@Injectable()
export class ProductService {
    constructor(@InjectModel(Product.name) private productModel: Model<Product>) { }

    async create(createProductDto: any): Promise<Product> {
        try {
            const createdProduct = new this.productModel(createProductDto);
            return await createdProduct.save();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

    }

    async findAll(): Promise<Product[]> {
        try {
            return await this.productModel.find().exec()
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async findOne(id: string): Promise<Product> {
        try {
            return await this.productModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async update(id: string, updateProductDto: any): Promise<Product> {
        try {
            return await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async remove(id: string): Promise<Product> {
        try {
            return await this.productModel.findByIdAndDelete(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './product.schema';
import { QueryDto } from './query.dto';

@Injectable()
export class ProductService {
    constructor(@InjectModel(Product.name) private productModel: Model<Product>) { }

    async create(createProductDto: any): Promise<Product> {
        try {
            const createdProduct = new this.productModel(createProductDto);
            return await createdProduct.save();
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException(error);
        }

    }



    async findAll(query: QueryDto): Promise<Product[]> {
        const {
            filter = '{}',
            sort = '{}',
            limit = 10,
            skip = 0,
            select = '',
        } = query;
        const parsedFilter = JSON.parse(filter);
        const parsedSort = JSON.parse(sort);
        try {
            console.log(parsedSort) 
            return await this.productModel
                .find(parsedFilter)
                .sort(parsedSort)
                .skip(Number(skip))
                .limit(Number(limit))
                .select(select)
                .exec()
        } catch (error) {
            console.log(error)
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

    async update(id: Types.ObjectId, updateProductDto: any): Promise<Product> {
        try {
            return await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async increaseAmount(id: Types.ObjectId, amount: number): Promise<Product> {
        try {
            console.log(id, amount)
            const product = await this.productModel.findById(id).exec();
            let dbquantity = product.quantity
            let newquantity = dbquantity + amount
            product.quantity = newquantity;
            return await product.save();
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }


    async decreaseAmount(id: string, amount: number): Promise<Product> {
        try {
            const product = await this.productModel.findById(id).exec();
            product.quantity -= amount;
            return await product.save();
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

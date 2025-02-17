import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Supplier } from './supplier.schema';
import { QueryDto } from 'src/product/query.dto';

@Injectable()
export class SupplierService {
    constructor(
        @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,

    ) { }

    async createSupplier(data: any): Promise<any> {
        const supplier = new this.supplierModel(data);
        return supplier.save();
    }

    async getAllSuppliers(query: QueryDto): Promise<any> {
        const {
            filter = '{}',
            sort = '{}',
            skip = 0,
            select = '',
        } = query;
        const parsedFilter = JSON.parse(filter);
        const parsedSort = JSON.parse(sort);
       
        try {
            return await this.supplierModel
                .find(parsedFilter)
                .sort(parsedSort)
                .skip(Number(skip))
                .select(select)
                .exec()
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async addOrder(supplierId: Types.ObjectId, orderId: Types.ObjectId): Promise<any> {
        const supplier = await this.supplierModel.findById(supplierId);
        if (!supplier) {
            throw new BadRequestException('Supplier not found');
        }
        supplier.orders.push(orderId);

        await supplier.save()
    }

    async getSupplierDetails(supplierId: string): Promise<any> {
        return this.supplierModel.findById(supplierId).populate('orders.items.product').exec();
    }
}

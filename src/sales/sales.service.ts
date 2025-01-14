import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryService } from 'src/product/inventory.service';
import { Sale } from './sales.schema';

@Injectable()
export class SalesService {
    constructor(
        private inventoryService: InventoryService,
        @InjectModel(Sale.name) private readonly saleModel: Model<Sale>
    ) { }

    async doSell(sellData: any): Promise<any> {
        try {
            const data = await this.saleModel.create(sellData);

            for (const element of data.product) {
                await this.inventoryService.deductStock(element.prodId, element.amount)
            }
            return data
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
    async findAll(): Promise<Sale[]> {
        try {
            return await this.saleModel.find().exec();
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async findOne(id: string): Promise<Sale> {
        try {
            return await this.saleModel.findById(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async update(id: string, updateData: any): Promise<Sale> {
        try {
            return await this.saleModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async delete(id: string): Promise<any> {
        try {
            return await this.saleModel.findByIdAndDelete(id).exec();
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Purchase } from './purchases.schema';

@Injectable()
export class PurchasesService {
    constructor(@InjectModel(Purchase.name) private purchaseModel: Model<Purchase>) { }

    async create(createPurchaseDto: any): Promise<Purchase> {
        const createdPurchase = new this.purchaseModel(createPurchaseDto);
        return createdPurchase.save();
    }

    async findAll(): Promise<Purchase[]> {
        return this.purchaseModel.find().exec();
    }

    async findOne(id: string): Promise<Purchase> {
        return this.purchaseModel.findById(id).exec();
    }

    async update(id: string, updatePurchaseDto: any): Promise<Purchase> {
        return this.purchaseModel.findByIdAndUpdate(id, updatePurchaseDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Purchase> {
        return this.purchaseModel.findByIdAndDelete(id).exec();
    }
}

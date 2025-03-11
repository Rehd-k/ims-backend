import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QueryDto } from 'src/product/query.dto';
import { Customer } from './customer.schema';

@Injectable()
export class CustomerService {
    constructor(
        @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,

    ) { }

    async createCustomer(data: any): Promise<any> {
        const customer = new this.customerModel(data);
        return customer.save();
    }

    async getAllCustomers(query: QueryDto): Promise<any> {
        const {
            filter = '{}',
            sort = '{}',
            skip = 0,
            select = '',
        } = query;
        const parsedFilter = JSON.parse(filter);
        const parsedSort = JSON.parse(sort);

        if (parsedFilter.nameOrPhonenumber) {
            const nameOrPhonenumber = parsedFilter.nameOrPhonenumber;

            parsedFilter.$or = [
                { name: { $regex: new RegExp(nameOrPhonenumber, "i") } },
                { phone_number: { $regex: new RegExp(nameOrPhonenumber, "i") } }
            ];
            delete parsedFilter.nameOrPhonenumber;
        }
        console.log(parsedFilter);
        try {
            return await this.customerModel
                .find(parsedFilter)
                .sort(parsedSort)
                .limit(10)
                .skip(Number(skip))
                .select(select)
                .exec()
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(error);
        }
    }

    async addOrder(customerId: Types.ObjectId, orderId: Types.ObjectId, total_spent: number): Promise<any> {
        const customer = await this.customerModel.findById(customerId);
        if (!customer) {
            throw new BadRequestException('Customer not found');
        }
        customer.orders.push(orderId);
        customer.total_spent += 1000;

        await customer.save()
    }

    async addReturns(customerId: Types.ObjectId, orderId: Types.ObjectId): Promise<any> {
        const customer = await this.customerModel.findById(customerId);
        if (!customer) {
            throw new BadRequestException('Customer not found');
        }
        customer.returns.push(orderId);

        await customer.save()
    }

    async getCustomerDetails(customerId: string): Promise<any> {
        return this.customerModel.findById(customerId).populate('orders.returns').exec();
    }
    async updateCustomer(customerId: string, updateData: any): Promise<any> {
        const customer = await this.customerModel.findById(customerId);
        if (!customer) {
            throw new BadRequestException('Customer not found');
        }


        for (const key in updateData) {
            if (updateData.hasOwnProperty(key)) {
                if (key === 'increase' || key === 'decrease') {
                    for (const field in updateData[key]) {
                        if (updateData[key].hasOwnProperty(field)) {
                            if (key === 'increase') {
                                customer[field] += updateData[key][field];
                            } else if (key === 'decrease') {
                                customer[field] -= updateData[key][field];
                            }
                        }
                    }
                } else {
                    customer[key] = updateData[key];
                }
            }
        }

        return customer.save();
    }

    async deleteCustomer(customerId: string): Promise<any> {
        return this.customerModel.findByIdAndDelete(customerId).exec();
    }


}

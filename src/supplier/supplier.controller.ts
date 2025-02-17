import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { Types } from 'mongoose';
import { QueryDto } from 'src/product/query.dto';

@Controller('supplier')
export class SupplierController {
    constructor(private readonly supplierService: SupplierService) { }

    @Post()
    async createSupplier(@Body() data: any) {
        return this.supplierService.createSupplier(data);
    }

    @Post(':id/orders')
    async addOrder(@Param('id') supplierId: Types.ObjectId, @Body() order: any) {
        return this.supplierService.addOrder(supplierId, order);
    }

    @Get()
    async getSuppliers(
        @Query() query: QueryDto
    ) {
        return this.supplierService.getAllSuppliers(query);
    }


    @Get(':id')
    async getSupplierDetails(@Param('id') supplierId: string) {
        return this.supplierService.getSupplierDetails(supplierId);
    }
}

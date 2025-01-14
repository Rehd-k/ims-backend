import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SupplierService } from './supplier.service';

@Controller('supplier')
export class SupplierController {
    constructor(private readonly supplierService: SupplierService) { }

    @Post()
    async createSupplier(@Body() data: any) {
        return this.supplierService.createSupplier(data);
    }

    @Post(':id/orders')
    async addOrder(@Param('id') supplierId: string, @Body() order: any) {
        return this.supplierService.addOrder(supplierId, order);
    }

    @Post(':id/payments')
    async recordPayment(@Param('id') supplierId: string, @Body() payment: any) {
        return this.supplierService.recordPayment(supplierId, payment);
    }

    @Get(':id')
    async getSupplierDetails(@Param('id') supplierId: string) {
        return this.supplierService.getSupplierDetails(supplierId);
    }
}

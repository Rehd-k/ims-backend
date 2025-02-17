import { Controller } from '@nestjs/common';
import { Get, Post, Body, Param, Query } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { Types } from 'mongoose';
import { QueryDto } from 'src/product/query.dto';

@Controller('purchases')
export class PurchasesController {

    constructor(private readonly purchasesService: PurchasesService) { }

    @Post()
    create(@Body() createPurchaseDto: any) {
        return this.purchasesService.create(createPurchaseDto);
    }

    @Get()
    findAll(
        @Query() query: QueryDto
    ) {

        return this.purchasesService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.purchasesService.findOne(id);
    }

    @Post(':id/payments')
    async recordPayment(@Param('id') supplierId: Types.ObjectId, @Body() payment: any) {
        return this.purchasesService.recordPayment(supplierId, payment);
    }



}

import { Controller } from '@nestjs/common';
import { Get, Post, Body, Param } from '@nestjs/common';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {

    constructor(private readonly purchasesService: PurchasesService) { }

    @Get()
    findAll() {
        return this.purchasesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.purchasesService.findOne(id);
    }

    @Post()
    create(@Body() createPurchaseDto: any) {
        return this.purchasesService.create(createPurchaseDto);
    }
}

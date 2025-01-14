import { Controller } from '@nestjs/common';
import { Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post()
    create(@Body() createSaleDto: any) {
        return this.salesService.doSell(createSaleDto);
    }

    @Get()
    findAll() {
        return this.salesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salesService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateSaleDto: any) {
        return this.salesService.update(id, updateSaleDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.salesService.delete(id);
    }
}

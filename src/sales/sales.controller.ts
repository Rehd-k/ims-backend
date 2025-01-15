import { Controller, UseGuards } from '@nestjs/common';
import { Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }


    @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
    @Post()
    create(@Body() createSaleDto: any) {
        return this.salesService.doSell(createSaleDto);
    }

    @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
    @Get()
    findAll(
        @Body() filter: any
    ) {
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

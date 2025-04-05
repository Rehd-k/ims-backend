import { Controller, Query, Req, UseGuards } from '@nestjs/common';
import { Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';
import { QueryDto } from 'src/product/query.dto';



@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) { }


    @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
    @Post()
    create(@Body() createSaleDto: any, @Req() req: any) {
        return this.salesService.doSell(createSaleDto, req);
    }

    @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
    @Get()
    findAll(
        @Query() query: QueryDto, @Req() req: any
    ) {
        return this.salesService.findAll(query, req);
    }

    @Get('getchart/:id')
    getLineChart(@Param('id') id: string, @Query() query: QueryDto) {
        const chartData = this.salesService.getSingleProductSaleData(id, query);
        return chartData
    }

    @Get('findone/:id')
    findOne(@Param('id') id: string) {
        return this.salesService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateSaleDto: any) {
        return this.salesService.update(id, updateSaleDto);
    }

    @Put('return/:id')
    make_returns(@Param('id') id: string, @Body() updateSaleDto: any, @Req() req: any) {
        return this.salesService.return(id, updateSaleDto, req);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.salesService.delete(id);
    }

}

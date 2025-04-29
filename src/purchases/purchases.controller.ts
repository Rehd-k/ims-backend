import { Controller, Delete, Put, Req, UseGuards } from '@nestjs/common';
import { Get, Post, Body, Param, Query } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { Types } from 'mongoose';
import { QueryDto } from 'src/product/query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchases')
export class PurchasesController {

    constructor(private readonly purchasesService: PurchasesService) { }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Post()
    create(@Body() createPurchaseDto: any, @Req() req: any) {
        return this.purchasesService.create(createPurchaseDto, req);
    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Get()
    findAll(
        @Query() query: QueryDto,
        @Req() req: any
    ) {

        return this.purchasesService.findAll(query, req);
    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.purchasesService.findOne(id);
    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Post(':id/payments')
    async recordPayment(@Param('id') supplierId: Types.ObjectId, @Body() payment: any) {
        return this.purchasesService.recordPayment(supplierId, payment);
    }

    @Roles(Role.God, Role.Admin, Role.Manager)

    @Put('update/:id')
    async update(@Param('id') id: string, @Body() updatePurchaseDto: any) {

        return this.purchasesService.update(id, updatePurchaseDto);
    }

}

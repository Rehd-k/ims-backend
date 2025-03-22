import { Controller, Delete, InternalServerErrorException, Put, Query, UseGuards } from '@nestjs/common';
import { Get, Post, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';
import { QueryDto } from './query.dto';
import { Types } from 'mongoose';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService, private readonly inventoryService: InventoryService) { }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Post(

    )
    async createProduct(@Body() productDto: any) {
        return this.productService.create(productDto);
    }

    @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
    @Get()
    async getAllProducts(
        @Query() query: QueryDto
    ) {
        const data = await this.productService.findAll(query);
        return data;
    }

    @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
    @Get('/dashboard/:id')
    async getDashboardData(
        @Param('id') id: string,
        @Query() query: QueryDto,
    ) {
        try {
            const data = await this.inventoryService.getDashboardData(id, query.startDate, query.endDate);

            return data;
        } catch (error) {
            throw new InternalServerErrorException(error)
        }


    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Get('/findone/:id')
    async getProductById(@Param('id') productId: string) {

        return this.productService.findOne(productId);


    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Put('/update/:id')
    async updateProduct(@Param('id') productId: Types.ObjectId, @Body() updateDto: any) {
        return this.productService.update(productId, updateDto);
    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Delete('/delete/:id')
    async deleteProduct(@Param('id') productId: string) {
        return this.productService.remove(productId);
    }
}

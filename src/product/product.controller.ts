import { Controller, Delete, Put, UseGuards } from '@nestjs/common';
import { Get, Post, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Post()
    async createProduct(@Body() productDto: any) {
        return this.productService.create(productDto);
    }

    @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
    @Get()
    async getAllProducts() {
        return this.productService.findAll();
    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Get(':id')
    async getProductById(@Param('id') productId: string) {
        return this.productService.findOne(productId);
    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Put(':id')
    async updateProduct(@Param('id') productId: string, @Body() updateDto: any) {
        return this.productService.update(productId, updateDto);
    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Delete(':id')
    async deleteProduct(@Param('id') productId: string) {
        return this.productService.remove(productId);
    }
}

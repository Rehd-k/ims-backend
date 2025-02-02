import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Post, Put, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';
import { QueryDto } from 'src/product/query.dto';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    async createCategory(@Body() body: any) {
        return this.categoryService.createCategory(body);
    }

    @Get()
    async getCategorys(
        @Query() query: QueryDto
    ) {
        try {
            return this.categoryService.getCategorys(query);
        } catch (err) {
            throw new InternalServerErrorException(err);
        }

    }

    @Get(':id')
    async getCategoryById(@Param('id') CategoryId: string) {
        return this.categoryService.getCategoryById(CategoryId);
    }

    @Put(':id')
    async updateCategoryById(@Param('id') CategoryId: string, @Body() updateDto: any) {
        return this.categoryService.update(CategoryId, updateDto);
    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Delete(':id')
    async deleteProduct(@Param('id') CategoryId: string) {
        return this.categoryService.remove(CategoryId);
    }
}

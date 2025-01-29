import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    async createCategory(@Body() body: any) {
        return this.categoryService.createCategory(body);
    }

    @Get()
    async getCategorys() {
        return this.categoryService.getCategorys();
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

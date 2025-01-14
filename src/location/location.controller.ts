import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { LocationService } from './location.service';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';

@Controller('location')
export class LocationController {
    constructor(private readonly locationService: LocationService) { }

    @Post()
    async createStore(@Body() body: any) {
        const { name, location, manager, contact } = body;
        return this.locationService.createStore(name, location, manager, contact);
    }

    @Get()
    async getStores() {
        return this.locationService.getStores();
    }

    @Get(':id')
    async getStoreById(@Param('id') storeId: string) {
        return this.locationService.getStoreById(storeId);
    }

    @Put(':id')
    async updateStoreById(@Param('id') storeId: string, @Body() updateDto: any) {
        return this.locationService.update(storeId, updateDto);
    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Delete(':id')
    async deleteProduct(@Param('id') storeId: string) {
        return this.locationService.remove(storeId);
    }

}

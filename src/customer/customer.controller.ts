import { Controller, Query, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Get, Post, Body, Param } from '@nestjs/common';
import { QueryDto } from 'src/product/query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customer')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Get()
    findAll(
        @Query() query: QueryDto
    ) {
        return this.customerService.getAllCustomers(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customerService.getCustomerDetails(id);
    }

    @Post()
    create(@Body() createCustomerDto: any) {
        return this.customerService.createCustomer(createCustomerDto);
    }

    @Post(':id')
    update(@Param('id') customerId: string, @Body() updateCustomerDto: any) {
        return this.customerService.updateCustomer(customerId, updateCustomerDto);
    }

    @Post(':id/delete')
    delete(@Param('id') id: string) {
        return this.customerService.deleteCustomer(id);
    }
}

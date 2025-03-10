import { Controller, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Get, Post, Body, Param } from '@nestjs/common';
import { QueryDto } from 'src/product/query.dto';

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

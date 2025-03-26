import { Controller, Delete, Put, Req, UseGuards, Request } from '@nestjs/common';
import { Get, Post, Body, Param } from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('banks')
export class BanksController {
    constructor(private readonly banksService: BanksService) { }

    @Roles(Role.God, Role.Admin, Role.Manager, Role.Cashier, Role.Staff)
    @Get()
    findAll() {
        return this.banksService.findAll();
    }

    @Roles(Role.God, Role.Admin, Role.Manager, Role.Cashier, Role.Staff)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.banksService.findOne(id);
    }

    @Roles(Role.God, Role.Admin, Role.Manager)
    @Post()
    create(@Body() createBankDto: CreateBankDto, @Req() req :any) {
        return this.banksService.create(createBankDto, req);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateBankDto: CreateBankDto) {
        return this.banksService.update(id, updateBankDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.banksService.remove(id);
    }


}
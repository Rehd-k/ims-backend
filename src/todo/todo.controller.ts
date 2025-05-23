import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryDto } from 'src/product/query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';

@Controller('todo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) { }


  @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @Req() req: any) {
    return this.todoService.create(createTodoDto, req);
  }

  @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
  @Get()
  findAll(
    @Query() queryDto: QueryDto, @Req() req: any
  ) {
    return this.todoService.findAll(queryDto, req);
  }

  @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todoService.findOne(id);
  }

  @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto, @Req() req: any) {
    return this.todoService.update(id, updateTodoDto, req);
  }

  @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todoService.remove(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryDto } from 'src/product/query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';

@Controller('todo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) { }

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @Req() req: any) {
    return this.todoService.create(createTodoDto, req);
  }

  @Get()
  findAll(
    @Query() queryDto: QueryDto
  ) {
    return this.todoService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto, @Req() req: any) {
    return this.todoService.update(id, updateTodoDto, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.todoService.remove(id, req);
  }
}

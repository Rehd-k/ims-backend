import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './todo.schema';
import { QueryDto } from 'src/product/query.dto';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private readonly todoModel: Model<Todo>) { }

  async create(createTodoDto: CreateTodoDto, req: any) {
    try {
      const newTodo = await this.todoModel.create(createTodoDto)
      return newTodo;
    } catch (error) {
      console.log(error)
      throw new BadRequestException(error)
    }

  }

  async findAll(query: QueryDto) {
    const {
      filter = '{}',
      sort = '{}',
      skip = 0,
      select = '',
      limit = 0
    } = query;
    const parsedFilter = JSON.parse(filter);
    const parsedSort = JSON.parse(sort);
    const todo = await this.todoModel
      .find(parsedFilter)
      .sort(parsedSort)
      .skip(Number(skip))
      .limit(Number(limit))
      .select(select)
      .exec();
      console.log(todo);
      return todo;

  }

  async findOne(id: string) {
    return await this.todoModel.findById(id)
  }



  async update(id: string, updateTodoDto: UpdateTodoDto, req: any) {
    const updateFields = {};
    for (const key in updateTodoDto) {
      if (updateTodoDto.hasOwnProperty(key)) {
        updateFields[key] = updateTodoDto[key];
      }
    }
    const updatedTodo = await this.todoModel.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).exec();
    return updatedTodo;
  }


  async remove(id: string, req: any) {
    await this.todoModel.findByIdAndDelete(id);
  }
}

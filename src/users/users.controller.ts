import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    const orderParam: Prisma.UserOrderByWithRelationInput = {};

    if (orderBy) {
      // Example: orderBy can be 'createdAt_ASC' or 'name_DESC'
      const [field, order] = orderBy.split('_');
      if (field && order) {
        orderParam[field] = order as 'asc' | 'desc';
      }
    }
    const users = await this.usersService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      orderBy: orderParam,
    });

    return users;
  }

  @Get()
  async findOne(@Body() email: string) {
    return await this.usersService.findOne(email);
  }
}

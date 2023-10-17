import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { GetUser } from '@/common/decorators/get-users.decorator';

@ApiTags('users')
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

  @Get('byEmail')
  async findByEmail(@Query('email') email: string) {
    return await this.usersService.findByEmail(email);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  update(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() currentUser,
  ) {
    return this.usersService.update(updateUserDto, currentUser);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetUser } from '@/common/decorators/get-users.decorator';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Post(':productId')
  create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() currentUser,
    @Param('productId') productId: string
  ) {
    // deepcode ignore WrongNumberOfArgs: <please specify a reason of ignoring this>
    return this.ordersService.create(createOrderDto, currentUser, productId);
  }

  @Get()
  findAll(@Query('page') page: number, @Query('perPage') perPage: number) {
    return this.ordersService.findAll(page, perPage);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('yourOrder/byUser')
  async findYourOrder(
    @GetUser() currenUser,
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 2,
  ) {
    return await this.ordersService.findYourOrder(currenUser, page, perPage);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @GetUser() currentUser,
  ) {
    return this.ordersService.update(id, updateOrderDto, currentUser);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() currentUser) {
    return this.ordersService.remove(id, currentUser);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('yourOrder/byUser/search')
  async searchYourOrder(
    @GetUser() user,
    @Query('keyword') keyword: string,
    @Query('searchBy') searchBy: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    const query = await this.ordersService.searchYourOrder(
      user,
      keyword,
      searchBy,
      page,
      perPage,
    );
    return query;
  }
}

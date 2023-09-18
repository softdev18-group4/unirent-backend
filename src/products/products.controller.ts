import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetUser } from '@/common/decorators/get-users.decorator';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { get } from 'http';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Product } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createProductDto, @GetUser() currentUser) {
    return this.productsService.create(createProductDto, currentUser);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() UpdateProductDto,
    @GetUser() currentUser,
  ) {
    return this.productsService.update(id, UpdateProductDto, currentUser);
  }

  @Get('/paginate/filter')
  async getProductsPagination(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 2,
  ) {
    return await this.productsService.findByPagination(page, perPage);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() currentUser) {
    return this.productsService.remove(id, currentUser);
  }
}

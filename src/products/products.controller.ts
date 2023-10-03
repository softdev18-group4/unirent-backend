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
import { GetUser } from '@/common/decorators/get-users.decorator';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @GetUser() currentUser) {
    return this.productsService.create(createProductDto, currentUser);
  }

  findAll() {
    return this.productsService.findAll();
  }

  @Get()
  async getProductsPagination(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return await this.productsService.findByPagination(page, perPage);
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Get('/yourProduct/byUser')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  async getProductsByUserId(
    @GetUser() user,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return await this.productsService.getProductsByUserId(user, page, perPage);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  update(
    @Param('id') id: string,
    @Body() UpdateProductDto,
    @GetUser() currentUser,
  ) {
    return this.productsService.update(id, UpdateProductDto, currentUser);
  }


  @Delete(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string, @GetUser() currentUser) {
    return this.productsService.remove(id, currentUser);
  }

  @Get('/allProduct/search')
  async searchProducts(
    @Query('keyword') keyword: string,
    @Query('searchBy') searchBy: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    const query = await this.productsService.searchProducts(
      keyword,
      searchBy,
      page,
      perPage,
    );
    return query;
  }


  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('/yourProduct/byUser/search')
  async searchYourProduct(
    @GetUser() user,
    @Query('keyword') keyword: string,
    @Query('searchBy') searchBy: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ){
    const query = await this.productsService.searchYourProduct(
      user,
      keyword,
      searchBy,
      page,
      perPage,
    );
    return query;

  }
}

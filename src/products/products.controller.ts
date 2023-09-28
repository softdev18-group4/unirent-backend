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

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth('JWT-auth')
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

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Get('yourProduct/byUser')
  async getProductsByUserId(@GetUser() user) {
    return await this.productsService.getProductsByUserId(user);
  }

  @ApiBearerAuth('JWT-auth')
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

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() currentUser) {
    return this.productsService.remove(id, currentUser);
  }

  @Get('/search/detail')
  async searchProducts(
    @Query('keyword') keyword: string = '',
    @Query('searchBy') searchBy: string = '',
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 2,
  ) {
    const query = await this.productsService.searchProducts(
      keyword,
      searchBy,
      page,
      perPage,
    );
    return query;
  }
}

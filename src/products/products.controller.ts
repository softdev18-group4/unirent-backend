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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiQueryOptional } from '@/decorators/api-query-optional.decorator';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @GetUser() currentUser) {
    return this.productsService.create(createProductDto, currentUser);
  }

  // findAll() {
  //   return this.productsService.findAll();
  // }

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

  @Get('/userProduct/:id')
  async getProductsOtherUserId(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return await this.productsService.getProductsByOtherUserId(
      id,
      page,
      perPage,
    );
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() currentUser,
  ) {
    return await this.productsService.update(id, updateProductDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string, @GetUser() currentUser) {
    return this.productsService.remove(id, currentUser);
  }

  @Get()
  @ApiQueryOptional(['keyword', 'searchBy', 'page', 'perPage'])
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

  @Get('/yourProduct/byUser/search')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiQueryOptional(['keyword', 'searchBy', 'page', 'perPage'])
  async searchYourProduct(
    @GetUser() user,
    @Query('keyword') keyword: string,
    @Query('searchBy') searchBy: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
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

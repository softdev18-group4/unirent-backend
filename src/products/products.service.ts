import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { error } from 'console';
import { AllExceptionsFilter } from '@/http-exception.filter';

function getProperty(obj, path) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current[key] === undefined) return undefined;
    current = current[key];
  }

  return current;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, currentUser) {
    try {
      const {
        name,
        description,
        specifications,
        availableDays,
        rentalOptions,
      } = createProductDto;

      // Validate availableDays dates
      const startDate = new Date(availableDays.startDate);
      const endDate = new Date(availableDays.endDate);

      if (startDate > endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      const newProduct = await this.prisma.product.create({
        data: {
          name,
          description,
          specifications,
          ownerId: currentUser.id as string,
          availableDays: {
            startDate,
            endDate,
          },
          availability: true,
          rentalOptions: {
            create: rentalOptions.map((option) => ({
              type: option.type,
              priceRate: option.priceRate,
            })),
          },
        },
        include: {
          rentalOptions: true,
        },
      });

      return newProduct;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async findById(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        rentalOptions: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviews: {
          select: {
            text: true,
            rating: true,
            reviewerId: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    return product;
  }

  async findAll() {
    const allproduct = this.prisma.product.findMany({
      include: {
        rentalOptions: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviews: {
          select: {
            text: true,
            rating: true,
            reviewerId: true,
          },
        },
      },
    });
    return allproduct;
  }

  async findByPagination(page: number = 1, perPage: number = 5) {
    try {
      const skip = (page - 1) * perPage;
      const query = await this.prisma.product.findMany({
        skip: skip,
        take: +perPage,
      });
      return query;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async update(id: string, updateProductDto: UpdateProductDto, currentUser) {
    const { name, description, specifications, availableDays, rentalOptions } =
      updateProductDto;

    try {
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
        include: {
          rentalOptions: true,
        },
      });

      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }

      if (existingProduct.ownerId !== currentUser.id) {
        throw new BadRequestException(
          'You do not have permission to update this product',
        );
      }

      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          name,
          description,
          specifications: {
            ...specifications,
          },
          availableDays: {
            update: {
              startDate: new Date(availableDays.startDate),
              endDate: new Date(availableDays.endDate),
            },
          },
          availability: true,
        },
      });

      for (const rentalOption of rentalOptions) {
        const existingRental = await existingProduct.rentalOptions.find(
          (rental) => rental.type === rentalOption.type,
        );
        if (existingRental) {
          if (rentalOption.isSelected) {
            await this.prisma.rentalOption.update({
              where: { id: existingRental.id },
              data: {
                priceRate: rentalOption.priceRate,
              },
            });
          } else {
            await this.prisma.rentalOption.delete({
              where: { id: existingRental.id },
            });
          }
        } else if (rentalOption.isSelected) {
          await this.prisma.rentalOption.create({
            data: {
              productId: existingProduct.id,
              type: rentalOption.type,
              priceRate: rentalOption.priceRate,
            },
          });
        }
      }

      return updatedProduct;
    } catch (error) {
      throw new BadRequestException('Failed to update product');
    }
  }

  async getProductsByUserId(user, page, perPage) {
    try {
     
      const skip = (page - 1) * perPage;
      const userProduct = await this.prisma.product.findMany({
        where: { ownerId: user.id },
        include:{
          rentalOptions:true,
          reviews: true,
          owner:{
            select:{
              firstName:true,
              lastName:true
            }
          }
        },
        skip: skip,
        take: +perPage,
      });

      return userProduct; // Array of products associated with the user
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async remove(id: string, currentUser) {
    try {
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
        include: {
          rentalOptions: true,
          reviews: true,
        },
      });

      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }

      if (existingProduct.ownerId !== currentUser.id) {
        throw new BadRequestException(
          'You do not have permission to update this product',
        );
      }
      await this.prisma.rentalOption.deleteMany({ where: { productId: id } });
      await this.prisma.review.deleteMany({ where: { productId: id } });
      await this.prisma.product.delete({ where: { id } });

      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete product');
    }
  }

  async searchProducts(keyword = '', searchBy = '', page = 1, perPage = 5) {
    try {
      const allProducts = this.findAll();
      // Define the properties you want to search within
      let propertiesToSearch = [];

      if (searchBy === '') {
        propertiesToSearch = [
          'name',
          'description',
          'specifications.brand',
          'specifications.model',
          'specifications.processor',
          'specifications.graphicCard',
          // Add more properties as needed
        ];
      } else if (searchBy === 'name') {
        propertiesToSearch = ['name'];
      } else if (searchBy === 'brand') {
        propertiesToSearch = ['specifications.brand'];
      } else if (searchBy === 'model') {
        propertiesToSearch = ['specifications.model'];
      } else if (searchBy === 'processor') {
        propertiesToSearch = ['specifications.processor'];
      } else if (searchBy === 'graphicCard') {
        propertiesToSearch = ['specifications.graphicCard'];
      }

      // Filter products based on the search criteria
      const filteredProducts = (await allProducts).filter((product) => {
        for (const property of propertiesToSearch) {
          const propertyValue = getProperty(product, property);
          if (
            propertyValue &&
            propertyValue
              .toString()
              .toLowerCase()
              .includes(keyword.toLowerCase())
          ) {
            return true; // Found a match, include this product
          }
        }
        return false; // No match found for this product
      });

      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;

      // Slice the filtered products to return only the items for the current page
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return paginatedProducts;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async searchYourProduct(currentUser , keyword = '', searchBy = '', page = 1, perPage = 5){
    try {
      const allProducts = await this.getProductsByUserId(currentUser, page, perPage);
      // Define the properties you want to search within
      console.log(allProducts)
      let propertiesToSearch = [];

      if (searchBy === '') {
        propertiesToSearch = [
          'name',
          'description',
          'specifications.brand',
          'specifications.model',
          'specifications.processor',
          'specifications.graphicCard',
          // Add more properties as needed
        ];
      } else if (searchBy === 'name') {
        propertiesToSearch = ['name'];
      } else if (searchBy === 'brand') {
        propertiesToSearch = ['specifications.brand'];
      } else if (searchBy === 'model') {
        propertiesToSearch = ['specifications.model'];
      } else if (searchBy === 'processor') {
        propertiesToSearch = ['specifications.processor'];
      } else if (searchBy === 'graphicCard') {
        propertiesToSearch = ['specifications.graphicCard'];
      }

      // Filter products based on the search criteria
      const filteredProducts = (await allProducts).filter((product) => {
        for (const property of propertiesToSearch) {
          const propertyValue = getProperty(product, property);
          if (
            propertyValue &&
            propertyValue
              .toString()
              .toLowerCase()
              .includes(keyword.toLowerCase())
          ) {
            return true; // Found a match, include this product
          }
        }
        return false; // No match found for this product
      });

      return filteredProducts;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }

  }
}

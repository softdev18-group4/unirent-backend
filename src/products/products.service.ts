import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';

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
    const { name, description, specifications, availableDays, rentalOptions } =
      createProductDto;

    const newProduct = await this.prisma.product.create({
      data: {
        name: name,
        description,
        specifications,
        ownerId: currentUser.id as string,
        availableDays: {
          startDate: new Date(availableDays.startDate),
          endDate: new Date(availableDays.endDate),
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

  async findByPagination(page: number = 1, perPage: number = 2) {
    const skip = (page - 1) * perPage;
    const query = await this.prisma.product.findMany({
      skip: skip,
      take: +perPage,
    });
    return query;
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

  async getProductsByUserId(user) {
    try {
      if (!user) {
        throw new Error('User not found');
      }

      const userProduct = await this.prisma.product.findMany({
        where: { ownerId: user.id },
      });

      return userProduct; // Array of products associated with the user
    } catch (error) {
      console.error('Error fetching products by user ID:', error);
      throw new Error('Internal server error');
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

  async searchProducts(keyword = '', searchBy = '', page = 1, perPage = 2) {
    const allProducts = this.findAll();

    // Define the properties you want to search within
    let propertiesToSearch = [];

    if (searchBy === 'all') {
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
          propertyValue.toString().toLowerCase().includes(keyword.toLowerCase())
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
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, currentUser) {
    const { name, description, specifications, availableDays, rentalOptions } =
      createProductDto;

    const newProduct = await this.prisma.product.create({
      data: {
        name,
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
    });

    return newProduct;
  }

  async findById(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        rentalOptions: true,
      },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    return product;
  }

  async findAll() {
    return this.prisma.product.findMany();
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
      // Check if the product exists
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }

      // Check if the current user has permission to update this product
      if (existingProduct.ownerId !== currentUser.id) {
        throw new BadRequestException(
          'You do not have permission to update this product',
        );
      }

      // Update the product
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          name,
          description,
          specifications,
          availableDays: {
            update: {
              startDate: new Date(availableDays.startDate),
              endDate: new Date(availableDays.endDate),
            },
          },
          availability: true,
          rentalOptions: {
            upsert: rentalOptions.map((option) => ({
              where: { type: option.type },
              create: {
                type: option.type,
                priceRate: option.priceRate,
              },
              update: {
                type: option.type,
                priceRate: option.priceRate,
              },
            })),
          },
        },
      });

      return updatedProduct;
    } catch (error) {
      throw new BadRequestException('Failed to update product');
    }
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}

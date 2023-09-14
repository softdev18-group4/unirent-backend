import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto, currentUser) {
    const { name, description, specifications, availableDays, rentalOptions } = createProductDto

    const newProduct = await this.prisma.product.create({
      data: {
        name,
        description,
        specifications,
        ownerId: currentUser.id as string,
        availableDays: {
          startDate: new Date(availableDays.startDate),
          endDate: new Date(availableDays.endDate)
        },
        availability: true,
        rentalOptions: {
          create: rentalOptions.map(option => ({
            type: option.type,
            priceRate: option.priceRate
          }))
        }
      }
    });

    return newProduct
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

  findAll() {
    return this.prisma.product.findMany();
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  // update(id: string, updateProductDto: UpdateProductDto) {
  //   return this.prisma.product.update({
  //     where: { id },
  //     data: updateProductDto,
  //   });
  // }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}

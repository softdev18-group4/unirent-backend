import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AllExceptionsFilter } from '@/http-exception.filter';
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
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, currentUser, productId) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      console.log(product);

      const rentOption = await this.prisma.rentalOption.findUnique({
        where: { id: createOrderDto.rentalId },
      });
      console.log(rentOption);

      // const date = new Date();
      // const rentTime = createOrderDto.rentTime;

      // if (rentOption.type.toLowerCase() === 'daily') {
      //   date.setDate(date.getDate() + rentTime);
      // } else if (rentOption.type.toLowerCase() === 'weekly') {
      //   date.setDate(date.getDate() + rentTime * 7);
      // } else if (rentOption.type.toLowerCase() === 'monthly') {
      //   date.setMonth(date.getMonth() + rentTime);
      // } else {
      //   throw new BadRequestException('Invalid rent type');
      // }

      // if (
      //   !(
      //     date >= product.availableDays.startDate &&
      //     date <= product.availableDays.endDate
      //   )
      // ) {
      //   console.log(date);
      //   console.log(product.availableDays);
      //   throw new BadRequestException(
      //     'Cannot be rented beyond the date of opening for rent.',
      //   );
      // }

      if (product.availability === false) {
        console.log(product.availability);
        throw new BadRequestException('Product not available.');
      } else {
        const newOrder = await this.prisma.order.create({
          data: {
            productId: productId,
            userId: currentUser.id,
            rentalId: createOrderDto.rentalId,
            rentTime: createOrderDto.rentTime,
            amount: rentOption.priceRate,
          },
        });

        await this.prisma.product.update({
          where: { id: productId },
          data: {
            availability: false,
          },
        });

        return {
          message: 'Order created successfully',
          order: newOrder,
        };
      }
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  findAll(page: number = 1, perPage: number = 5) {
    try {
      const skip = (page - 1) * perPage;
      return this.prisma.order.findMany({
        include: {
          product: true,
          rentalOption: true,
        },
        skip: skip,
        take: +perPage,
      });
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        rentalOption: true,
      },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, currentUser) {
    try {
      const existingOrder = await this.prisma.order.findUnique({
        where: { id },
        include: {
          product: true,
          rentalOption: true,
        },
      });
      const userId = existingOrder?.userId;

      if (!userId) {
        throw new NotFoundException('Order not found');
      }

      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      if (existingOrder.userId !== currentUser.id) {
        throw new ForbiddenException('Permission Denied');
      }

      const updateOrder = await this.prisma.order.update({
        where: { id },
        data: {
          rentalId: updateOrderDto.rentalId,
          status: updateOrderDto.status,
          rentTime: updateOrderDto.rentTime,
          amount: updateOrderDto.amount,
          transactionId: updateOrderDto.transactionId,
        },
      });

      return {
        message: 'update success',
        order: updateOrder,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id: string, currentUser) {
    try {
      const existingOrder = await this.prisma.order.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      if (existingOrder.userId !== currentUser.id) {
        throw new BadRequestException('Permission Denied');
      }

      await this.prisma.product.update({
        where: { id: existingOrder.productId },
        data: {
          availability: true,
        },
      });
      await this.prisma.order.delete({ where: { id } });

      return { message: 'Deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete');
    }
  }

  async findYourOrder(currentUser, page = 1, perPage = 2) {
    try {
      const skip = (page - 1) * perPage;
      const yourOrder = await this.prisma.order.findMany({
        where: { userId: currentUser.id },
        include: {
          product: true,
          rentalOption: true,
        },
        skip: skip,
        take: +perPage,
      });
      return yourOrder;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async searchYourOrder(currentUser, keyword, searchBy, page = 1, perPage = 5) {
    try {
      const allOrder = await this.findYourOrder(currentUser, page, perPage);
      // Define the properties you want to search withi
      let propertiesToSearch = [];

      if (searchBy === '') {
        propertiesToSearch = [
          'product.name',
          'product.description',
          'product.specifications.brand',
          'product.specifications.model',
          'product.specifications.processor',
          'product.specifications.graphicCard',
          // Add more properties as needed
        ];
      } else if (searchBy === 'name') {
        propertiesToSearch = ['product.name'];
      } else if (searchBy === 'product.brand') {
        propertiesToSearch = ['product.specifications.brand'];
      } else if (searchBy === 'model') {
        propertiesToSearch = ['product.specifications.model'];
      } else if (searchBy === 'processor') {
        propertiesToSearch = ['product.specifications.processor'];
      } else if (searchBy === 'graphicCard') {
        propertiesToSearch = ['product.specifications.graphicCard'];
      }

      // Filter products based on the search criteria
      const filteredOrder = (await allOrder).filter((product) => {
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

      return filteredOrder;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
}

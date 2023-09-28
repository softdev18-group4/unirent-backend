import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AllExceptionsFilter } from '@/http-exception.filter';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class OrdersService {

  constructor(private prisma: PrismaService) { }
  async create(createOrderDto: CreateOrderDto) {

    try {

      const newOrder = await this.prisma.order.create({
        data: {
          productId: createOrderDto.productId,
          userId: createOrderDto.userId,
          rentalId: createOrderDto.rentalId,
        },
      });


      return { message: 'Order created successfully', order: newOrder };
    } catch (error) {
      throw new AllExceptionsFilter(error)
    }

  }

  findAll() {
    try {
      return this.prisma.order.findMany();
    }
    catch (error) {
      throw new AllExceptionsFilter(error);
    }

  }

  findOne(id: string) {
    return this.prisma.order.findUnique({ where: { id } })
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, currentUser) {
    try {
      const existingOrder = await this.prisma.order.findUnique({ where: { id } });
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
          productId: updateOrderDto.productId,
          userId: updateOrderDto.userId,
          rentalId: updateOrderDto.rentalId,
        }
      });

      return { message: 'update success', update: updateOrder }
    }
    catch (error) {
      throw new Error(error)
    }
  }

  async remove(id: string, currentUser) {
    try {
      const existingOrder = await this.prisma.order.findUnique({
        where: { id }
      });

      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      if (existingOrder.userId !== currentUser.id) {
        throw new BadRequestException(
          'Permission Denied',
        );
      }

      await this.prisma.order.delete({ where: { id } });

      return { message: 'Deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete');
    }
  }
}

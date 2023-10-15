import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { AllExceptionsFilter } from '@/http-exception.filter';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}
  async create(createCouponDto: CreateCouponDto, currentUser) {
    try {
      const role = currentUser.role.toLowerCase();
      if (role !== 'admin') {
        throw new UnauthorizedException('Unauthorized');
      }

      const newCoupon = await this.prisma.coupons.create({
        data: {
          expireDate: createCouponDto.expireDate,
          code: createCouponDto.code,
          discount: createCouponDto.discount,
          amount: createCouponDto.amount,
          userAlreadyUsed: [],
        },
      });
      return newCoupon;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  findAll() {
    try {
      return this.prisma.coupons.findMany();
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.coupons.findUnique({ where: { id: id } });
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    try {
      const coupon = await this.findOne(id);

      for (const e in updateCouponDto.userAlreadyUsed) {
        coupon.userAlreadyUsed.push(updateCouponDto.userAlreadyUsed[e]);
      }

      const updateCoupon = await this.prisma.coupons.update({
        where: { id },
        data: {
          expireDate: updateCouponDto.expireDate,
          code: updateCouponDto.code,
          discount: updateCouponDto.discount,
          amount: updateCouponDto.amount,
          userAlreadyUsed: coupon.userAlreadyUsed,
        },
      });

      return { message: 'update success', updateCoupon };
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.coupons.delete({ where: { id } });
      return { message: 'Deleted successfully' };
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }
}

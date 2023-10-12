import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { error } from 'console';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) { }

  async create(id: string, createReviewDto: CreateReviewDto, currentUser) {
    const { text, rating } = createReviewDto;
    try {
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }

      return await this.prisma.review.create({
        data: {
          text: text,
          rating: rating,
          reviewerId: currentUser.id as string,
          productId: id,
        },
      });
    } catch (error) {
      throw new BadRequestException('Cannot create review');
    }
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new Error(`review withID ${id} not found`);
    }

    return review;
  }

  async remove(id: string) {
    try {
      const existingReview = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!existingReview) {
        throw new NotFoundException('Review not found');
      }

      await this.prisma.review.delete({ where: { id } });
      return { message: 'delete success' };
    } catch (error) {
      throw new BadRequestException('cannot delete review');
    }
  }

}

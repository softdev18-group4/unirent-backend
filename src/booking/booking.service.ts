import { All, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { AllExceptionsFilter } from '@/http-exception.filter';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) { }

  findAll() {
    try{
      return this.prisma.booking.findMany();
    }
    catch(error){
      throw new AllExceptionsFilter(error)
    }
  }

  findOne(id: string) {
    try{
      return this.prisma.booking.findUnique({where:{id}});
    }
    catch(error){
      throw new AllExceptionsFilter(error)
    }
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }


  async getYourBooking(currentUser) {

    try {
      const booking = await this.prisma.booking.findMany({
        where: {
          product: {
            ownerId: currentUser.id
          }
        },
        include: {
          product: true, // Include the product details if needed
          rentalOption: true
        }
      });

      return booking
    }
    catch (error) {
      throw new AllExceptionsFilter(error)
    }
  }
}

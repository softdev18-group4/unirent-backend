import { Injectable, UnauthorizedException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config'; // No need for ConfigModule here

@Injectable()
export class PaymentService {
  private stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_API_SECRET_KEY'),
      {
        apiVersion: '2023-08-16',
      },
    );
  }
  async createCustomer(currentUser: { id: any }) {
    const exitsUser = await this.prisma.user.findUnique({ where: { id: currentUser.id } })
    try {
      if (exitsUser.customerId === "") {
        console.log('create customer')
        const customer = await this.stripe.customers.create({
          email: exitsUser.email,
          name: exitsUser.firstName
        })
        const updateUser = await this.prisma.user.update({
          where: { id: currentUser.id },
          data: {
            customerId: customer.id
          }
        }
        )
        return customer.id
      }
      else {
        console.log('already customer')
        return exitsUser.customerId
      }
    } catch (err) {
      throw new err
    }
  }

  async createPayment(orderId: string, currentUser: { id: any }): Promise<any> {
    let sumAmount = 0;
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

      if (order.userId != currentUser.id) {
        throw new UnauthorizedException('Unauthorized'); // Changed the status code and message
      }

      const customerId = await this.createCustomer(currentUser)

      sumAmount = order.amount;

      return this.stripe.paymentIntents.create({
        amount: sumAmount * 100,
        currency: 'thb',
        customer: customerId.toString(),
        payment_method_types: ['card'],
      });
    } catch (err) {
      throw new err
    }
  }

}

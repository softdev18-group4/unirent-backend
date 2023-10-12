import { Injectable, UnauthorizedException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
    private stripe;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.stripe = new Stripe(configService.get<string>('API_SECRET_KEY'), {
            apiVersion: '2023-08-16',
        });
    }
    async createPayment(orderId: string, currentUser: { id: any; }): Promise<any> {
        let sumAmount = 0;
        const order = await this.prisma.order.findUnique({
            where: {
                id: orderId
            }
        });
        if (order.userId != currentUser.id){
            throw new UnauthorizedException('401', 'Unauthorized')
        }
        sumAmount = order.amount;
        return this.stripe.paymentIntents.create({
            amount: sumAmount * 100,
            currency: 'thb',
            payment_method_types: ['card'],
        });
    }
}

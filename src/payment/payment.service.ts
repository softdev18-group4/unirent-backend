import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
    private stripe;
    
    constructor(private prisma: PrismaService, private configService: ConfigService) {
        this.stripe = new Stripe(configService.get<string>('API_SECRET_KEY'), {
            apiVersion: '2023-08-16',
        });
    }
    async createPayment(orderId : string): Promise<any> {
        
        let sumAmount = 0;
        const order = await this.prisma.order.findUnique({ where: {id: orderId } })
        sumAmount = order.amount
        console.log(sumAmount)
        return this.stripe.paymentIntents.create({
            amount: sumAmount * 100,
            currency: "thb",
            payment_method_types: ['card'],
        });
    }
}
import { Injectable } from '@nestjs/common';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { PrismaService } from '@/prisma/prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookService {
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

  async createTransaction(req: Request) {
    const endpointSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    let event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        endpointSecret,
      );
    } catch (err) {
      console.log(err);
      return;
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = await event.data.object;
        console.log(paymentIntentSucceeded);

        if (paymentIntentSucceeded.status === 'succeeded') {
          try {
            await this.prisma.order.update({
              where: { transactionId: paymentIntentSucceeded.id },
              data: {
                status: 'succeeded',
              },
            });
          } catch (err) {
            throw new err();
          }
        }
        break;

      // case 'customer.created':
      //   const customer = event.data.object;
      //   console.log(customer)

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { messege: 'payment success' };
  }
}

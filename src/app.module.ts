import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './config/env.validation';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UploadModule } from './upload/upload.module';
import { OrdersModule } from './orders/orders.module';
import { CouponsModule } from './coupons/coupons.module';
import { ConversationModule } from './chat/conversation/conversation.module';
import { PaymentController } from './payment/payment.controller';
import { PaymentModule } from './payment/payment.module';
import { PaymentService } from './payment/payment.service';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    PrismaModule,
    ReviewsModule,
    UploadModule,
    OrdersModule,
    CouponsModule,
    ConversationModule,
    PaymentModule,
    WebhookModule,
  ],
  controllers: [AppController, PaymentController],
  providers: [AppService, PaymentService],
})
export class AppModule {}

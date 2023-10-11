import { Body, Controller, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Response } from 'express';


@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) { }

  @Post(':orderId')
  createPayments(
    @Res() response: Response,
    @Param('orderId') orderId :string,
  ) {
    this.paymentService
      .createPayment(orderId)
      .then((res) => {
        response.status(HttpStatus.CREATED).json(res);
      })
      .catch((err) => {
        response.status(HttpStatus.BAD_REQUEST).json({ message: err });
      });
  }
}
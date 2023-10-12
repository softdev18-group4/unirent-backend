import { Body, Controller, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Response } from 'express';
import { GetUser } from '@/common/decorators/get-users.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@/common/guards/jwt.guard';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
    constructor(private paymentService: PaymentService) { }

    
    @Post(':orderId')
    @ApiBearerAuth('JWT-auth')
    @UseGuards(JwtGuard)
    createPayments(@Res() response: Response, @Param('orderId') orderId: string, @GetUser() currentUser) {
        this.paymentService
            .createPayment(orderId, currentUser)
            .then((res) => {
                response.status(HttpStatus.CREATED).json(res);
            })
            .catch((err) => {
                response.status(HttpStatus.BAD_REQUEST).json({ message: err });
            });
    }
}

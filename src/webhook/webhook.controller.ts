import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import stripe from 'stripe';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) { }

  @Post()
  async creatTransaction(
    @Req() req: Request,
  ) {
    return await this.webhookService.createTransaction(req)
  }

}

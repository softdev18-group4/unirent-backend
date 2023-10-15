import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  providers: [MessageService, PrismaService],
})
export class MessageModule {}

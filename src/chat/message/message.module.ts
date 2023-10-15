import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [],
  providers: [MessageService, PrismaService],
  exports: [MessageService],
})
export class MessageModule {}

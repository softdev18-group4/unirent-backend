import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationGateway } from './conversation.gateway';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  providers: [ConversationService, ConversationGateway, PrismaService],
  controllers: [ConversationController]
})
export class ConversationModule {}

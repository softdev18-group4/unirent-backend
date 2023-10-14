import { Module } from '@nestjs/common';
import { JoinedConversationService } from './joined-conversation.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [],
  providers: [JoinedConversationService, PrismaService],
  exports: [JoinedConversationService],
})
export class JoinedConversationModule {}

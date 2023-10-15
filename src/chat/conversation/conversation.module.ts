import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationGateway } from './conversation.gateway';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { MessageModule } from '../message/message.module';
import { JoinedConversationModule } from '../joined-conversation/joined-conversation.module';
import { ConnectedUserModule } from '../connected-user/connected-user.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    MessageModule,
    JoinedConversationModule,
    ConnectedUserModule,
  ],
  providers: [ConversationService, ConversationGateway, PrismaService],
  controllers: [ConversationController],
})
export class ConversationModule {}

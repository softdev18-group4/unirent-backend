import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { User } from '@prisma/client';
import { MessageSeenDto } from '../dto/message-seen.dto';
// import { ConversationGateway } from '../conversation/conversation.gateway';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
  ) // private conversationGateway: ConversationGateway,
  {}

  async createMessage(
    currentUser : User,
    createMessageDto: CreateMessageDto,
  ) {
    console.log(currentUser);
    const createdMessage = await this.prisma.message.create({
      data: {
        text: createMessageDto.text,
        conversationId: createMessageDto.conversationId,
        senderId: currentUser.id,
      },
      // include: {
      //   conversation: true,
      // },
    });
    // this.conversationGateway.sendMessage(createdMessage);
    return createdMessage;
  }

  async getMessagesByConversation(conversationId: string) {
    return await this.prisma.message.findMany({
      where: {
        conversationId,
      },
      // include: {
      //   conversation: true,
      //   sender: true,
      // },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async markMessageAsSeen(messageSeenDto: MessageSeenDto) {
    const { messageId } = messageSeenDto;
    const message = await this.prisma.message.findFirst({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException({ name: "Message not found!" })
    }
    message.seen = true;  
  }
}

import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(conversationId: string, senderId: string, message: string) {
    return await this.prisma.message.create({
      data: {
        text: message,
        conversationId,
        senderId,
      },
      include: {
        conversation: true,
      },
    });
  }

  async getMessagesByConversation(conversationId: string) {
    return await this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}

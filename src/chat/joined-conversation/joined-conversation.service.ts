import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateJoinedConversationDto } from '../dto/create-joined-conversation.dto';
import { User } from '@prisma/client';

@Injectable()
export class JoinedConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createJoinedConversationDto: CreateJoinedConversationDto,
    currentUser: User,
  ) {
    return await this.prisma.joinedConversation.create({
      data: {
        socketId: createJoinedConversationDto.socketId,
        userId: currentUser.id,
        conversationId: createJoinedConversationDto.conversationId,
      },
    });
  }

  async findByUser(userId: string) {
    return await this.prisma.joinedConversation.findMany({ where: { userId } });
  }

  async findByConversation(conversationId: string) {
    return await this.prisma.joinedConversation.findMany({
      where: { conversationId },
    });
  }

  async deleteBySocketId(socketId: string) {
    return await this.prisma.joinedConversation.deleteMany({
      where: { socketId },
    });
  }

  async deleteAll() {
    await this.prisma.joinedConversation.deleteMany();
  }
}

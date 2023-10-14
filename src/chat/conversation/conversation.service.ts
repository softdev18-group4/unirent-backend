import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { User } from '@prisma/client';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllConversation() {
    return this.prisma.conversation.findMany();
  }

  async getConversation(id: string) {
    return this.prisma.conversation.findUnique({ where: { id } });
  }

  async createConversation(
    createConversationDto: CreateConversationDto,
    currentUser: User,
  ) {
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        participants: {
          hasEvery: [createConversationDto.id, currentUser.id],
        },
      },
    });
    if (existingConversation) {
      throw new BadRequestException({ name: 'Conversation already exists' });
    }

    return await this.prisma.conversation.create({
      data: {
        users: {
          connect: [{ id: currentUser.id }, { id: createConversationDto.id }],
        },
      },
    });
  }

  async getConversationByUser(id: string) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          has: id,
        },
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });
  }

  async deleteConversation(id: string) {
    const existingConversation = this.prisma.conversation.findFirst({
      where: { id },
    });

    if (!existingConversation) {
      throw new NotFoundException({ name: 'Conversation not found' });
    }

    await this.prisma.conversation.delete({ where: { id } });
    return { message: 'Conversation deleted succussfully' };
  }
}

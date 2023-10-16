import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { User } from '@prisma/client';
import { AllExceptionsFilter } from '@/http-exception.filter';

@Injectable()
export class ConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllConversation() {
    return await this.prisma.conversation.findMany();
  }

  async getConversation(id: string) {
    return await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: true,
      },
    });
  }

  async createConversation(
    createConversationDto: CreateConversationDto,
    currentUser: User,
  ) {
    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        participants: {
          hasEvery: [createConversationDto.userId, currentUser.id],
        },
      },
    });
    if (existingConversation) {
      return existingConversation;
    }

    return await this.prisma.conversation.create({
      data: {
        users: {
          connect: [
            { id: currentUser.id },
            { id: createConversationDto.userId },
          ],
        },
      },
    });
  }

  async getConversationByUser(
    currentUser: User,
    page: number,
    perPage: number,
  ) {
    try {
      const skip = (page - 1) * perPage;
      const userConversation = await this.prisma.conversation.findMany({
        where: {
          participants: {
            has: currentUser.id,
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
        skip: skip,
        take: +perPage,
      });
      return userConversation;
    } catch (error) {
      throw new AllExceptionsFilter(error);
    }
  }

  async getUsersByConversation(id: string) {
    const { participants } = await this.prisma.conversation.findFirst({
      where: { id },
      select: {
        participants: true,
      },
    });
    return participants;
  }

  async deleteConversation(id: string) {
    const existingConversation = await this.prisma.conversation.findFirst({
      where: { id },
    });

    if (!existingConversation) {
      throw new NotFoundException({ name: 'Conversation not found' });
    }

    const userIdArray = await this.prisma.user.findMany({
      where: {
        conversationIDs: {
          has: id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!userIdArray) {
      throw new NotFoundException({ name: 'Conversation is empty' });
    }

    // console.log(userIdArray)
    for (const userIdObj of userIdArray) {
      const userId = userIdObj.id;

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const updateConversationIDs = user.conversationIDs.filter(
          (conversationID) => conversationID !== id,
        );

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            conversationIDs: updateConversationIDs,
          },
        });
      }
    }

    await this.prisma.conversation.delete({ where: { id } });
    return { message: 'Conversation deleted succussfully' };
  }
}

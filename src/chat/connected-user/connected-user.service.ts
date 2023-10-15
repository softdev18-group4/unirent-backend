import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class ConnectedUserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(socketId: string, currentUser: User) {
    return await this.prisma.connectedUser.create({
      data: {
        socketId: socketId,
        userId: currentUser.id,
      },
    });
  }

  async findByUser(userId: string) {
    return await this.prisma.connectedUser.findMany({ where: { userId } });
  }

  async deleteBySocketId(socketId: string) {
    return await this.prisma.connectedUser.deleteMany({ where: { socketId } });
  }

  async deleteAll() {
    await this.prisma.connectedUser.deleteMany();
  }
}

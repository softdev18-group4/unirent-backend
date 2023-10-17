import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({ data: createUserDto });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(query: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: query,
    });
  }

  async findOneAndCreateIfNotExist(
    query: Prisma.UserWhereUniqueInput,
    data: Prisma.UserCreateInput,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: query,
    });

    if (user) {
      return user;
    }

    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async update(
    updateUserDto: UpdateUserDto,
    currentUser,
  ): Promise<User> {
    const { firstName, lastName, password, profileImage } = updateUserDto;
    try {
      const updateUser = this.prisma.user.update({
        where: { id: currentUser.id },
        data: {
          firstName,
          lastName,
          password,
          profileImage,
        },
      });
      return updateUser;
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }
}

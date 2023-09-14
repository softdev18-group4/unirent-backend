import {
  HttpException,
  HttpStatus,
  NotFoundException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ResetToken, Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@/common/enums/role.enum';
import { PrismaService } from '@/prisma/prisma.service';

import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  private generateToken({
    userId,
    role,
  }: {
    userId: string;
    role: string;
  }): string {
    const payload = { sub: userId, role };
    return this.jwtService.sign(payload);
  }

  private generateResetToken(length: number): string {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }

    return password;
  }

  async signUp(signUpDto: SignUpDto) {
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

      const createdUser = await this.userService.create({
        ...signUpDto,
        password: hashedPassword,
      });

      return {
        access_token: this.generateToken({
          userId: createdUser.id,
          role: Role.User,
        }),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      const userExisting = await this.userService.findOne({
        email: signInDto.email,
      });

      if (!userExisting) {
        throw new NotFoundException(
          `No user found for email: ${signInDto.email}`,
        );
      }

      const isPasswordValid = bcrypt.compareSync(
        signInDto.password,
        userExisting.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      return {
        access_token: this.generateToken({
          userId: userExisting.id,
          role: userExisting.role,
        }),
      };
    } catch (error) {
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async OAuthWithGoogle(user) {
    console.log(user);
    const userExisting = await this.userService.findOneAndCreateIfNotExist(
      {
        email: user.email,
      },
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: null,
        role: Role.User,
        verified: true,
      },
    );

    return {
      access_token: this.generateToken({
        userId: userExisting.id,
        role: userExisting.role,
      }),
    };
  }

  async createResetToken(email: string): Promise<ResetToken> {
    const userExisting = await this.userService.findByEmail(email);
    if (!userExisting) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const resetTokenExisting = await this.prisma.resetToken.findFirst({
      where: { userId: userExisting.id },
    });

    if (
      resetTokenExisting &&
      (new Date().getTime() - resetTokenExisting.timestamp.getTime()) / 60000 <
      15
    ) {
      throw new HttpException(
        'RESET_PASSWORD.EMAIL_SENT_RECENTLY',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else {
      const resetToken = await this.prisma.resetToken.create({
        data: {
          userId: userExisting.id,
          token: this.generateResetToken(21),
          timestamp: new Date(),
        },
      });

      if (!resetToken) {
        throw new HttpException(
          "Can't create ResetToken",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return resetToken;
    }
  }
}

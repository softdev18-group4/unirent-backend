import {
  HttpException,
  HttpStatus,
  NotFoundException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private generateJwtToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }

  async signUp(signUpDto: SignUpDto) {
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
    try {
      const createdUser = await this.userService.create({
        ...signUpDto,
        password: hashedPassword,
      });
      return { access_token: this.generateJwtToken(createdUser.id) };
    } catch (error) {
      console.log(error);
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
    const user = await this.userService.findOne(signInDto.email);

    if (!user) {
      throw new NotFoundException(
        `No user found for email: ${signInDto.email}`,
      );
    }

    const isPasswordValid = bcrypt.compareSync(
      signInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return {
      access_token: this.generateJwtToken(user.id),
    };
  }

  async signInWithGoogle(user) {
    const userExisting = await this.userService.findOne(user.email);
    if (!userExisting) {
      throw new NotFoundException(`No user found for email: ${user.email}`);
    }

    return {
      access_token: this.generateJwtToken(user.id),
    };
  }
}

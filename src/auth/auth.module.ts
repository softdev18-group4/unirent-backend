import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { GoogleStrategy } from '@/common/strategies/google.strategy';
import { JwtStrategy } from '@/common/strategies/jwt.strategy';
import { PrismaService } from '@/prisma/prisma.service';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRES_IN')}h`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, GoogleStrategy, JwtStrategy],
})
export class AuthModule {}

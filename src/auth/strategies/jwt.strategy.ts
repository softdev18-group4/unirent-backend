import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { IJwtPayload } from '../interfaces/jwt.interface';
import { UsersService } from '@/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: IJwtPayload) {
    const userExisting = await this.userService.findOne({
      id: payload.sub,
    });

    if (!userExisting) {
      throw new UnauthorizedException();
    }

    return {
      ...userExisting,
      password: undefined,
    };
  }
}

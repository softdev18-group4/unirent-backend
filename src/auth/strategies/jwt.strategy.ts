// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { InjectModel } from '@nestjs/mongoose';
// import { PassportStrategy } from '@nestjs/passport';
// import { Model } from 'mongoose';
// import { Strategy, ExtractJwt } from 'passport-jwt';
// import { IUser } from '@/common/interfaces/user.interface';
// import { User } from '@/modules/users/schemas/user.schema';
// import { IJwtPayload } from '../interfaces/jwt.interface';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     configService: ConfigService,
//     @InjectModel(User.name) private userModel: Model<IUser>,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: configService.get('jwtSecret'),
//     });
//   }

//   async validate(payload: IJwtPayload): Promise<IUser> {
//     const user = await this.userModel
//       .findOne({ _id: payload.sub })
//       .select('-password')
//       .exec();

//     if (!user) {
//       throw new UnauthorizedException();
//     }

//     return user;
//   }
// }

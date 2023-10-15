import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { GoogleOauthGuard } from '@/common/guards/google-oauth.guard';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { GetUser } from '@/common/decorators/get-users.decorator';

import { AuthService } from './auth.service';

import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Post('sign-up')
  async signup(@Body() signUpDto: SignUpDto, @Res() res) {
    const token = await this.authService.signUp(signUpDto);
    res.setHeader('Authorization', `${token}`);
    return res.status(201).json({ message: 'Sign up successfully' });
  }

  @Post('sign-in')
  async signin(@Body() signInDto: SignInDto, @Res() res) {
    const token = await this.authService.signIn(signInDto);
    res.setHeader('Authorization', `${token}`);
    return res.status(200).json({ message: 'Sign in successfully' });
  }

  @Post('google')
  @UseGuards(GoogleOauthGuard)
  async googleOAuth(@Req() req, @Res() res) {
    const token = await this.authService.OAuthWithGoogle(req.user);
    res.setHeader('Authorization', `${token}`);
    return res.status(200).json({ message: 'Sign in successfully' });
  }

  @ApiBearerAuth('JWT-auth')
  @Get('profile')
  @UseGuards(JwtGuard)
  async profile(@GetUser() user) {
    return user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body) {
    const { email } = body;
    return this.authService.createResetToken(email);
  }
}

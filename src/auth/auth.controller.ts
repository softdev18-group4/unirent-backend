import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from './guards/jwt.guard';
import { GetUser } from './decorators/get-users.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Post('sign-up')
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  async signin(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('callback/google')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req) {
    return await this.authService.OAuthWithGoogle(req.user);
  }

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

import { Controller, Get, Global, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { LoginResponseDto } from './dto';
import { KakaoAuthGuard } from './guard';

interface LoginRequest extends Request {
  user: {
    token: string;
    refreshToken: string;
    isProfileComplete: boolean;
    userId: string;
  };
}

@Controller('auth')
export class AuthController {
  @UseGuards(KakaoAuthGuard)
  @Get('kakao')
  kakaoLogin() {
    return;
  }

  @UseGuards(KakaoAuthGuard)
  @Get('/kakao/callback')
  kakaoLoginCallback(@Req() req: LoginRequest): LoginResponseDto {
    const { token, refreshToken, isProfileComplete, userId } = req.user;
    return { token, refreshToken, isProfileComplete, userId };
  }
}

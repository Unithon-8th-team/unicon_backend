import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

import { LoginResponseDto } from './dto';
import { KakaoAuthGuard } from './guard';

interface LoginRequest extends Request {
  user: {
    token: string;
    refreshToken: string;
  };
}

@Controller('auth')
export class AuthController {
  @ApiOperation({
    summary: 'kakao login',
  })
  @UseGuards(KakaoAuthGuard)
  @Get('kakao')
  kakaoLogin() {
    return;
  }

  @ApiOperation({ summary: '카카오 로그인 콜백 (토큰 반환)' })
  @ApiOkResponse({
    description: '카카오 로그인 성공시 AccessToken, RefreshToken 반환',
    type: LoginResponseDto,
  })
  @UseGuards(KakaoAuthGuard)
  @Get('/kakao/callback')
  kakaoLoginCallback(@Req() req: LoginRequest): LoginResponseDto {
    const { token, refreshToken } = req.user;
    return { token, refreshToken };
  }
}

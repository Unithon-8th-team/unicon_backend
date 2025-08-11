import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

import { AuthService } from '../auth.service';

type Profile = {
  id: string;
  displayName: string;
  username?: string;
  profileUrl?: string;
  provider: string;
  _json: {
    id: number;
    connected_at: string;
    properties: {
      nickname: string;
      profile_image: string;
      thumbnail_image: string;
    };
    kakao_account: {
      email?: string;
      profile_nickname_needs_agreement?: boolean;
      profile_image_needs_agreement?: boolean;
      has_email?: boolean;
      is_email_valid?: boolean;
      is_email_verified?: boolean;
    };
  };
};

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: `${configService.get('KAKAO_JS_ID')}`,
      callbackURL: 'http://10.0.2.2:3000/auth/kakao/callback',
    });
  }
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    // profile에서 정보 추출
    const userId = String(profile._json.id);
    const userName = profile.displayName;
    const userNickName = profile._json.properties.nickname;
    const provider = 'kakao';

    // // user 정보 확인 (현재는 주석 처리)
    // let user = await this.authService.validateUser(userId, provider);
    // if (!user) {
    //   user = await this.authService.create({
    //     userId,
    //     userName,
    //     userNickName,
    //     provider,
    //   });
    // }

    return this.generateTokens(userId, provider);
  }

  private generateTokens(userId: string, provider: string) {
    const token = this.authService.generateAccessToken({ userId, provider });
    const refreshToken = this.authService.generateRefreshToken({
      userId,
      provider,
    });

    return { token, refreshToken };
  }
}

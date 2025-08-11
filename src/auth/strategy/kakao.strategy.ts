import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

import { AuthService } from '../auth.service';
import { UserService } from '../../user';

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
    private readonly userService: UserService,
  ) {
    super({
      clientID: `${configService.get('KAKAO_JS_ID')}`,
      callbackURL: '/auth/kakao/callback',
    });
  }
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    const userKakaoId = String(profile._json.id);
    const userName = profile.displayName;
    const userNickName = profile._json.properties.nickname;
    const provider = 'kakao';

    let user = this.userService.isUserRegistered(userKakaoId);

    if (!user) {
      this.userService.addUser({
        id: userKakaoId,
        name: userName,
        email: userKakaoId || '',
        nickname: userNickName,
      });
    }

    const { token, refreshToken } = this.generateTokens(userKakaoId, provider);

    return {
      token,
      refreshToken,
      isProfileComplete: this.userService.isUserSettingCompleted(userKakaoId),
      userId: userKakaoId,
    };
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

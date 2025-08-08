import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// import { UserService, CreateUserDto, UserEntity } from '../user';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
  userId: string;
  provider: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    // private readonly userService: UserService,
  ) {}

  // async validateUser(
  //   userId: string,
  //   provider: string,
  // ): Promise<UserEntity | null> {
  // return await this.userService.findUserById(userId, provider);
  // }

  // async create(userData: CreateUserDto) {
  // return await this.userService.create(userData);
  // }

  // Access Token 발급
  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '3d',
    });
  }

  // Refresh Token 발급
  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '14d', // 14일 유지
    });
  }

  // Refresh Token 검증 후 새 Access Token 발급
  refreshAccessToken(refreshToken: string): string {
    const { userId, provider } = this.jwtService.verify<JwtPayload>(
      refreshToken,
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      },
    );

    return this.generateAccessToken({ userId, provider });
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'Access Token' })
  token: string;

  @ApiProperty({ description: 'Refresh Token' })
  refreshToken: string;
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import * as common from '../common';
import { SettingRequestDto } from './dto';

@UseGuards(common.AuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(':userId/profile')
  public getUserInfo(
    @common.AuthenticatedUser() user: common.AccessTokenPayloads,
  ) {
    return this.userService.getUserById(user.userId);
  }

  @Post(':userId/settings')
  public getUserSettings(
    @common.AuthenticatedUser() user: common.AccessTokenPayloads,
    @Body() settingDto: SettingRequestDto,
  ) {
    return this.userService.settingUserProfile(user.userId, settingDto);
  }
}

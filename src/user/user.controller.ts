import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import * as common from '../common';
import { SettingRequestDto } from './dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(':userId/profile')
  public getUserInfo(@Param('userId') userId) {
    return this.userService.getUserById(userId);
  }

  @Post(':userId/settings')
  public getUserSettings(
    @Param('userId') userId,
    @Body() settingDto: SettingRequestDto,
  ) {
    return this.userService.settingUserProfile(userId, settingDto);
  }
}

import { Controller, Post } from '@nestjs/common';

@Controller('ai')
export class AiController {
  constructor() {}
  @Post('/chat')
  getChatting(): string {
    return '';
  }
}

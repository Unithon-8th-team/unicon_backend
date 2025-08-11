import { Body, Controller, Param, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChattingRequestDto } from './dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Post('/chat/:userId')
  async getChatting(
    @Param('userId') userId,
    @Body() chattingRequestDto: ChattingRequestDto,
  ): Promise<string> {
    return await this.aiService.generateAngrySentence(chattingRequestDto);
  }
}

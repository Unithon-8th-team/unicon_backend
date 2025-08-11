import { Body, Controller, Param, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChattingRequestDto } from './dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Post(':userId/chat')
  async getChatting(
    @Param('userId') userId,
    @Body() chattingRequestDto: ChattingRequestDto,
  ): Promise<string> {
    return await this.aiService.generateAngrySentence(chattingRequestDto);
  }

  @Post(':userId/generate-image-code')
  async generateImage(
    @Param('userId') userId,
    @Body() body: { message: string },
  ) {
    return await this.aiService.findClosestImages(body.message);
  }
}

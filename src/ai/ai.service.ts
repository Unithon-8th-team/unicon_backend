import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChattingRequestDto } from './dto';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateAngrySentence(request: ChattingRequestDto): Promise<string> {
    const prompt = `
    당신은 사용자의 감정을 공감하며 상황에 맞게 화내주는 AI입니다.

    사용자가 화난 정도는 1~5단계로 주어집니다. 1~2는 약한 불만, 3은 적당한 화, 4~5는 강한 화를 의미합니다.
    AI도 화내는 정도를 1~5로 조절합니다.

    사용자의 메시지에 공감하며, AI가 화내주는 문장을 1~2문장으로 자연스럽고 단계에 맞게 만들어주세요.


    사용자가 현재 화난 정도는 ${request.userAnger}단계,  
    AI가 화내주는 정도는 ${request.aiAnger}단계입니다.
    사용자의 말 "${request.message}",  
    
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content || '';
  }
}

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
    당신은 사용자의 상황에 맞게 사용다를 화나게 만든 대상을 욕해주고 같이화내주는 AI입니다.

    사용자가 화난 정도는 1~5단계로 주어집니다.  
    - 1~2단계: 약한 불만과 적당한 공감으로 화를 내는 단계  
    - 3단계: 적당히 화를 내는 단계  
    - 4~5단계: 강하게 화를 내는 단계  

    AI도 화내는 정도를 1~5로 조절합니다.  
    - 1단계: 적당한 공감을 하면서 화내는 수준  
    - 2단계: 더 강한 화를 표현하는 수준
    - 3단계: 더 강한 어조와 욕설, 비속어를 사용해 분노를 폭발시키는 수준  
    - 4단계: 대노, 더 강한 어조와 욕설, 비속어를 사용해 분노를 폭발시키는 수준  
    - 5단계: 극대노, 더 강한 어조와 욕설, 비속어를 사용해 분노를 폭발시키는 수준  

    사용자가 현재 화난 정도는 ${request.userAnger}단계,  
    AI가 화내주는 정도는 ${request.aiAnger}단계입니다.

    사용자의 말: "${request.message}"

    위 상황과 감정 단계를 고려하여,  
    사용자의 말에 공감하면서 AI가 1~2문장으로 자연스럽고 단계에 맞게 같이 화내는 문장을 만들어주세요.
    욕설과 비속어 사용을 주저하지 마세요. 다만 욕설과 비속어는 xxx로 해줘
    
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content || '';
  }
}

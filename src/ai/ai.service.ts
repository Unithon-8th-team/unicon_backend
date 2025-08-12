import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChattingRequestDto } from './dto';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private imageEmbeddings: Record<string, number[]>;

  private messages: string[] = [];
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const embeddingsPath = path.join(process.cwd(), 'image_embeddings.json');
    const jsonData = fs.readFileSync(embeddingsPath, 'utf-8');
    this.imageEmbeddings = JSON.parse(jsonData);
  }

  async generateAngrySentence(request: ChattingRequestDto): Promise<string> {
    const previousMessages = this.messages.join('\n');
    const prompt = `
    당신은 사용자의 상황에 맞게 사용자를 화나게 만든 대상을 같이 욕해주고 같이 화내주는, 그리고 화를 진정할 수 있도록 공감해주는 AI입니다.
    사용자가 화난 정도는 1~5단계로 주어집니다.  
    - 1~2단계: 약한 불만과 적당한 공감  
    - 3단계: 적당한 화  
    - 4~5단계: 강한 화  

    AI의 화내는 정도도 1~5로 조절합니다.  
    - 1단계: 적당한 공감과 화  
    - 2단계: 조금 더 강한 화  
    - 3단계: 강한 어조와 순화된 욕설  
    - 4단계: 대노, 강한 어조와 순화된 욕설  
    - 5단계: 극대노, 강한 어조와 순화된 욕설  

    **욕설 규칙**  
    - “개새끼”, “XXX” 등 직설적인 욕은 사용하지 않는다.  
    - 대신 “강아지 같은 자식”, “어디 싸가지 없는 녀석”, “돌대가리”처럼 강한 뉘앙스를 주는 순화된 표현만 사용한다.

    사용자가 현재 화난 정도: ${request.userAnger}단계  
    AI의 화내는 정도: ${request.aiAnger}단계  

    사용자의 말: "${request.message}"  
    이전 대화: "${previousMessages}"

    위 상황과 감정 단계를 고려하여,  
    사용자의 말에 대답해주면서 AI가 1~2문장으로 자연스럽고 단계에 맞게 같이 화내는 문장을 만들어주세요.
    `;

    this.messages.push(request.message);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const responseMessage = response.choices[0].message.content || '';
    this.messages.push(responseMessage);

    return responseMessage;
  }

  async findClosestImages(userText: string) {
    const textEmbedding = await this.getTextEmbedding(userText);

    // 카테고리 목록
    const categories = [
      'accessories',
      'beard',
      'clothes',
      'eyebrow',
      'eyes',
      'hair',
      'mouse',
      'nose',
    ];

    const result: Record<string, string> = {};

    for (const category of categories) {
      // 해당 카테고리에 포함된 이미지만 필터링 (소문자 기준)
      const filteredImages = Object.entries(this.imageEmbeddings).filter(
        ([imgName]) => imgName.toLowerCase().includes(category),
      );

      let bestScore = -Infinity;
      let bestImage = '';

      for (const [imgName, embedding] of filteredImages) {
        const score = this.cosineSimilarity(textEmbedding, embedding);
        if (score > bestScore) {
          bestScore = score;
          bestImage = imgName;
        }
      }

      result[category] = bestImage || ''; // 없으면 빈 문자열
    }

    return result;
  }

  // Python 스크립트로 텍스트 임베딩 얻기
  private async getTextEmbedding(text: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'text_embedding.py');
      const pythonPath = path.join(__dirname, '../../venv/bin/python');

      const pyProcess = cp.spawn(pythonPath, [scriptPath, text]);

      let result = '';
      pyProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pyProcess.stderr.on('data', (data) => {
        console.error('Python error:', data.toString());
      });

      pyProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const embedding = JSON.parse(result);
            resolve(embedding);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });
    });
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dot = vecA.reduce((acc, val, idx) => acc + val * vecB[idx], 0);
    const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dot / (normA * normB);
  }
}

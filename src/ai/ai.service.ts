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

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const embeddingsPath = path.join(process.cwd(), 'image_embeddings.json');
    const jsonData = fs.readFileSync(embeddingsPath, 'utf-8');
    this.imageEmbeddings = JSON.parse(jsonData);
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

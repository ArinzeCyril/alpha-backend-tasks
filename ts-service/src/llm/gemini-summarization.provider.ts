import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

import {
    CandidateSummaryInput,
    CandidateSummaryResult,
    SummarizationProvider,
} from './summarization-provider.interface';

@Injectable()
export class GeminiSummarizationProvider implements SummarizationProvider {
    private readonly genAI: GoogleGenerativeAI;
    private readonly model: any;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        this.genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async generateCandidateSummary(
        input: CandidateSummaryInput,
    ): Promise<CandidateSummaryResult> {
        const prompt = `
      You are an expert recruiter. Analyze the following candidate documents and provide a structured summary.
      
      Documents:
      ${input.documents.join('\n\n---\n\n')}

      Return the result strictly as a JSON object with the following fields:
      - score: number (1-100)
      - strengths: string[]
      - concerns: string[]
      - summary: string (concise overview)
      - recommendedDecision: "advance", "hold", or "reject"
    `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up potential markdown formatting in text
            const jsonStr = text.replace(/```json|```/g, '').trim();
            return JSON.parse(jsonStr) as CandidateSummaryResult;
        } catch (error) {
            console.error('Gemini summarization failed:', error);
            throw new Error('Failed to generate summary via Gemini');
        }
    }
}

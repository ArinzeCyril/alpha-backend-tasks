import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GeminiSummarizationProvider } from './gemini-summarization.provider';
import { SUMMARIZATION_PROVIDER } from './summarization-provider.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SUMMARIZATION_PROVIDER,
      useClass: GeminiSummarizationProvider,
    },
  ],
  exports: [SUMMARIZATION_PROVIDER],
})
export class LlmModule { }

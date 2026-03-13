import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';

import { CandidateDocument } from '../entities/candidate-document.entity';
import { CandidateSummary } from '../entities/candidate-summary.entity';
import {
    SUMMARIZATION_PROVIDER,
    SummarizationProvider,
} from '../llm/summarization-provider.interface';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class SummaryWorker implements OnModuleInit {
    constructor(
        @InjectRepository(CandidateDocument)
        private documentRepo: Repository<CandidateDocument>,
        @InjectRepository(CandidateSummary)
        private summaryRepo: Repository<CandidateSummary>,
        @Inject(SUMMARIZATION_PROVIDER)
        private llmProvider: SummarizationProvider,
        private queueService: QueueService,
    ) { }

    onModuleInit() {
        // Start polling the "queue" every 5 seconds
        setInterval(() => this.processJobs(), 5000);
    }

    private async processJobs() {
        const jobs = this.queueService.getQueuedJobs();

        // In this fake queue, we'll just process anything with 'generate-summary'
        // and that isn't already being handled. For this assessment, we'll 
        // simply filter the jobs.
        for (const job of jobs) {
            if (job.name === 'generate-summary') {
                const { summaryId, candidateId } = job.payload as {
                    summaryId: string;
                    candidateId: string;
                };

                // Check if summary is still pending
                const summary = await this.summaryRepo.findOne({ where: { id: summaryId } });
                if (summary && summary.status === 'pending') {
                    await this.processSummary(summary, candidateId);
                }
            }
        }
    }

    private async processSummary(summary: CandidateSummary, candidateId: string) {
        try {
            summary.status = 'processing';
            await this.summaryRepo.save(summary);

            const docs = await this.documentRepo.find({ where: { candidateId } });
            const docTexts = docs.map((d) => d.rawText || '').filter((t) => t.length > 0);

            const result = await this.llmProvider.generateCandidateSummary({
                candidateId,
                documents: docTexts,
            });

            summary.status = 'completed';
            summary.score = result.score;
            summary.summary = result.summary;
            summary.strengths = result.strengths.join('\n');
            summary.concerns = result.concerns.join('\n');
            summary.decision = result.recommendedDecision;
            summary.provider = 'gemini';

            await this.summaryRepo.save(summary);
        } catch (error) {
            console.error(`Failed to process summary ${summary.id}:`, error);
            summary.status = 'failed';
            await this.summaryRepo.save(summary);
        }
    }
}

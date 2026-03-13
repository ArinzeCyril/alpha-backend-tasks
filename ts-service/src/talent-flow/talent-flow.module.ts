import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CandidateDocument } from '../entities/candidate-document.entity';
import { CandidateSummary } from '../entities/candidate-summary.entity';
import { SampleCandidate } from '../entities/sample-candidate.entity';
import { LlmModule } from '../llm/llm.module';
import { QueueModule } from '../queue/queue.module';
import { TalentFlowController } from './talent-flow.controller';
import { DocumentService } from './document.service';
import { SummaryService } from './summary.service';
import { SummaryWorker } from './summary.worker';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SampleCandidate,
            CandidateDocument,
            CandidateSummary,
        ]),
        LlmModule,
        QueueModule,
    ],
    controllers: [TalentFlowController],
    providers: [DocumentService, SummaryService, SummaryWorker],
})
export class TalentFlowModule { }

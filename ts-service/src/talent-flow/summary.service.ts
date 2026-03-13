import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { CandidateSummary } from '../entities/candidate-summary.entity';
import { SampleCandidate } from '../entities/sample-candidate.entity';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class SummaryService {
    constructor(
        @InjectRepository(CandidateSummary)
        private summaryRepo: Repository<CandidateSummary>,
        @InjectRepository(SampleCandidate)
        private candidateRepo: Repository<SampleCandidate>,
        private queueService: QueueService,
    ) { }

    async requestSummary(
        workspaceId: string,
        candidateId: string,
    ): Promise<CandidateSummary> {
        const candidate = await this.candidateRepo.findOne({
            where: { id: candidateId, workspaceId },
        });

        if (!candidate) {
            throw new NotFoundException('Candidate not found in this workspace');
        }

        // Create pending summary record
        const summary = this.summaryRepo.create({
            id: randomUUID(),
            candidateId,
            status: 'pending',
        });

        const savedSummary = await this.summaryRepo.save(summary);

        // Enqueue background job
        this.queueService.enqueue('generate-summary', {
            summaryId: savedSummary.id,
            candidateId,
        });

        return savedSummary;
    }

    async getLatestSummary(
        workspaceId: string,
        candidateId: string,
    ): Promise<CandidateSummary> {
        const candidate = await this.candidateRepo.findOne({
            where: { id: candidateId, workspaceId },
        });

        if (!candidate) {
            throw new NotFoundException('Candidate not found in this workspace');
        }

        const summary = await this.summaryRepo.findOne({
            where: { candidateId },
            order: { createdAt: 'DESC' },
        });

        if (!summary) {
            throw new NotFoundException('No summary found for this candidate');
        }

        return summary;
    }

    async listSummaries(
        workspaceId: string,
        candidateId: string,
    ): Promise<CandidateSummary[]> {
        const candidate = await this.candidateRepo.findOne({
            where: { id: candidateId, workspaceId },
        });

        if (!candidate) {
            throw new NotFoundException('Candidate not found in this workspace');
        }

        return this.summaryRepo.find({
            where: { candidateId },
            order: { createdAt: 'DESC' },
        });
    }

    async getSummaryById(
        workspaceId: string,
        candidateId: string,
        summaryId: string,
    ): Promise<CandidateSummary> {
        const candidate = await this.candidateRepo.findOne({
            where: { id: candidateId, workspaceId },
        });

        if (!candidate) {
            throw new NotFoundException('Candidate not found in this workspace');
        }

        const summary = await this.summaryRepo.findOne({
            where: { id: summaryId, candidateId },
        });

        if (!summary) {
            throw new NotFoundException('Summary not found');
        }

        return summary;
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { CandidateDocument } from '../entities/candidate-document.entity';
import { SampleCandidate } from '../entities/sample-candidate.entity';
import { CreateCandidateDocumentDto } from './dto/create-candidate-document.dto';

@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(CandidateDocument)
        private documentRepo: Repository<CandidateDocument>,
        @InjectRepository(SampleCandidate)
        private candidateRepo: Repository<SampleCandidate>,
    ) { }

    async createDocument(
        workspaceId: string,
        candidateId: string,
        dto: CreateCandidateDocumentDto,
    ): Promise<CandidateDocument> {
        const candidate = await this.candidateRepo.findOne({
            where: { id: candidateId, workspaceId },
        });

        if (!candidate) {
            throw new NotFoundException('Candidate not found in this workspace');
        }

        const doc = this.documentRepo.create({
            id: randomUUID(),
            candidateId,
            type: dto.type,
            fileName: dto.fileName,
            storageKey: `docs/${candidateId}/${randomUUID()}`,
            rawText: dto.content, // Treating content as raw text for this assessment
        });

        return this.documentRepo.save(doc);
    }

    async getCandidateDocuments(
        workspaceId: string,
        candidateId: string,
    ): Promise<CandidateDocument[]> {
        const candidate = await this.candidateRepo.findOne({
            where: { id: candidateId, workspaceId },
        });

        if (!candidate) {
            throw new NotFoundException('Candidate not found in this workspace');
        }

        return this.documentRepo.find({ where: { candidateId } });
    }
}

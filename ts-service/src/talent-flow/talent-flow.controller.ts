import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';

import { FakeAuthGuard } from '../auth/fake-auth.guard';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/auth-user.decorator';
import { DocumentService } from './document.service';
import { SummaryService } from './summary.service';
import { CreateCandidateDocumentDto } from './dto/create-candidate-document.dto';

@Controller('candidates/:candidateId')
@UseGuards(FakeAuthGuard)
export class TalentFlowController {
    constructor(
        private documentService: DocumentService,
        private summaryService: SummaryService,
    ) { }

    @Post('documents')
    async uploadDocument(
        @Param('candidateId') candidateId: string,
        @Body() dto: CreateCandidateDocumentDto,
        @CurrentUser() user: AuthUser,
    ) {
        return this.documentService.createDocument(user.workspaceId, candidateId, dto);
    }

    @Get('documents')
    async getDocuments(
        @Param('candidateId') candidateId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.documentService.getCandidateDocuments(user.workspaceId, candidateId);
    }

    @Post('summaries/generate')
    async generateSummary(
        @Param('candidateId') candidateId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.summaryService.requestSummary(user.workspaceId, candidateId);
    }

    @Get('summaries')
    async listSummaries(
        @Param('candidateId') candidateId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.summaryService.listSummaries(user.workspaceId, candidateId);
    }

    @Get('summaries/:summaryId')
    async getSummaryById(
        @Param('candidateId') candidateId: string,
        @Param('summaryId') summaryId: string,
        @CurrentUser() user: AuthUser,
    ) {
        return this.summaryService.getSummaryById(user.workspaceId, candidateId, summaryId);
    }
}

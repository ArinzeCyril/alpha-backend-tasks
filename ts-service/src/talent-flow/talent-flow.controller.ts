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

@Controller('candidates/:id')
@UseGuards(FakeAuthGuard)
export class TalentFlowController {
    constructor(
        private documentService: DocumentService,
        private summaryService: SummaryService,
    ) { }

    @Post('documents')
    async uploadDocument(
        @Param('id') candidateId: string,
        @Body() dto: CreateCandidateDocumentDto,
        @CurrentUser() user: AuthUser,
    ) {
        return this.documentService.createDocument(user.workspaceId, candidateId, dto);
    }

    @Get('documents')
    async getDocuments(@Param('id') candidateId: string, @CurrentUser() user: AuthUser) {
        return this.documentService.getCandidateDocuments(user.workspaceId, candidateId);
    }

    @Post('summaries/generate')
    async generateSummary(@Param('id') candidateId: string, @CurrentUser() user: AuthUser) {
        return this.summaryService.requestSummary(user.workspaceId, candidateId);
    }

    @Get('summaries/latest')
    async getLatestSummary(@Param('id') candidateId: string, @CurrentUser() user: AuthUser) {
        return this.summaryService.getLatestSummary(user.workspaceId, candidateId);
    }
}

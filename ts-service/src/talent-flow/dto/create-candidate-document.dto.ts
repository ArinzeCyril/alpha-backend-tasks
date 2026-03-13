import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateCandidateDocumentDto {
    @IsEnum(['resume', 'cover_letter', 'other'])
    type!: string;

    @IsString()
    @IsNotEmpty()
    fileName!: string;

    @IsString()
    @IsNotEmpty()
    content!: string; // Base64 or raw text for simplicity in this assessment
}

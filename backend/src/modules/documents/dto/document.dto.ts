import { IsNotEmpty, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { DocumentCategory } from '../entities/document.entity';

export class CreateDocumentDto {
  @IsNotEmpty() employeeId: string;
  @IsNotEmpty() documentName: string;
  @IsOptional() @IsEnum(DocumentCategory) category?: DocumentCategory;
  @IsOptional() description?: string;
  @IsNotEmpty() fileUrl: string;
  @IsOptional() fileType?: string;
  @IsOptional() fileSize?: number;
  @IsOptional() @IsDateString() documentDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() remarks?: string;
}

export class UpdateDocumentDto {
  @IsOptional() documentName?: string;
  @IsOptional() @IsEnum(DocumentCategory) category?: DocumentCategory;
  @IsOptional() description?: string;
  @IsOptional() fileUrl?: string;
  @IsOptional() @IsDateString() documentDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsBoolean() isVerified?: boolean;
  @IsOptional() verifiedBy?: string;
  @IsOptional() remarks?: string;
}

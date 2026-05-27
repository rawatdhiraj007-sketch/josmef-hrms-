import { IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { NteStatus } from '../entities/nte.entity';

export class CreateNteDto {
  @IsNotEmpty() employeeId: string;
  @IsDateString() dateIssued: string;
  @IsOptional() @IsDateString() deadlineToReply?: string;
  @IsNotEmpty() subject: string;
  @IsNotEmpty() description: string;
  @IsOptional() issuedBy?: string;
  @IsOptional() remarks?: string;
}

export class UpdateNteDto {
  @IsOptional() employeeExplanation?: string;
  @IsOptional() @IsDateString() explanationDate?: string;
  @IsOptional() @IsEnum(NteStatus) status?: NteStatus;
  @IsOptional() resolution?: string;
  @IsOptional() remarks?: string;
}

export class QueryNteDto {
  @IsOptional() employeeId?: string;
  @IsOptional() @IsEnum(NteStatus) status?: NteStatus;
  @IsOptional() search?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

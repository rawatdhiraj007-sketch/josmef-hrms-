import { IsNotEmpty, IsOptional, IsEnum, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SeparationType, ClearanceStatus } from '../entities/exit-clearance.entity';

export class ClearanceItemDto {
  @IsNotEmpty() department: string;
  @IsNotEmpty() requirement: string;
  @IsOptional() remarks?: string;
}

export class CreateExitClearanceDto {
  @IsNotEmpty() employeeId: string;
  @IsEnum(SeparationType) separationType: SeparationType;
  @IsDateString() lastWorkingDay: string;
  @IsOptional() @IsDateString() resignationDate?: string;
  @IsOptional() @IsDateString() effectiveDate?: string;
  @IsOptional() reason?: string;
  @IsOptional() remarks?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClearanceItemDto)
  items?: ClearanceItemDto[];
}

export class UpdateExitClearanceDto {
  @IsOptional() @IsEnum(ClearanceStatus) status?: ClearanceStatus;
  @IsOptional() @IsDateString() completedDate?: string;
  @IsOptional() remarks?: string;
  @IsOptional() finalPay?: number;
  @IsOptional() finalPayReleased?: boolean;
}

export class ClearItemDto {
  @IsNotEmpty() clearanceItemId: string;
  @IsOptional() remarks?: string;
}

export class QueryExitClearanceDto {
  @IsOptional() @IsEnum(ClearanceStatus) status?: ClearanceStatus;
  @IsOptional() search?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

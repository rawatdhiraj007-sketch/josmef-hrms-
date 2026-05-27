import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { SeparationReason } from '../entities/former-employee.entity';

export class QueryFormerEmployeeDto {
  @IsOptional() search?: string;
  @IsOptional() department?: string;
  @IsOptional() @IsEnum(SeparationReason) separationReason?: SeparationReason;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

export class UpdateFormerEmployeeDto {
  @IsOptional() separationDetails?: string;
  @IsOptional() clearanceCompleted?: boolean;
  @IsOptional() @IsDateString() clearanceDate?: string;
  @IsOptional() finalPay?: number;
  @IsOptional() finalPayReleased?: boolean;
  @IsOptional() @IsDateString() finalPayReleaseDate?: string;
  @IsOptional() remarks?: string;
}

export class ArchiveEmployeeDto {
  @IsEnum(SeparationReason)
  separationReason: SeparationReason;

  @IsOptional()
  separationDetails?: string;

  @IsOptional()
  @IsDateString()
  dateSeparated?: string;

  @IsOptional()
  finalPay?: number;

  @IsOptional()
  remarks?: string;
}

import { IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { DisciplinaryType, DisciplinaryStatus } from '../entities/disciplinary.entity';

export class CreateDisciplinaryDto {
  @IsNotEmpty() employeeId: string;
  @IsEnum(DisciplinaryType) type: DisciplinaryType;
  @IsDateString() incidentDate: string;
  @IsOptional() @IsDateString() actionDate?: string;
  @IsNotEmpty() offense: string;
  @IsNotEmpty() description: string;
  @IsOptional() actionTaken?: string;
  @IsOptional() suspensionDays?: number;
  @IsOptional() @IsDateString() suspensionStartDate?: string;
  @IsOptional() @IsDateString() suspensionEndDate?: string;
  @IsOptional() remarks?: string;
  @IsOptional() issuedBy?: string;
}

export class UpdateDisciplinaryDto {
  @IsOptional() actionTaken?: string;
  @IsOptional() @IsEnum(DisciplinaryStatus) status?: DisciplinaryStatus;
  @IsOptional() remarks?: string;
  @IsOptional() suspensionDays?: number;
  @IsOptional() @IsDateString() suspensionStartDate?: string;
  @IsOptional() @IsDateString() suspensionEndDate?: string;
}

export class QueryDisciplinaryDto {
  @IsOptional() employeeId?: string;
  @IsOptional() @IsEnum(DisciplinaryType) type?: DisciplinaryType;
  @IsOptional() @IsEnum(DisciplinaryStatus) status?: DisciplinaryStatus;
  @IsOptional() search?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

import { IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { IncidentSeverity, IncidentStatus } from '../entities/incident-report.entity';

export class CreateIncidentReportDto {
  @IsOptional() reportedByEmployeeId?: string;
  @IsOptional() involvedEmployeeId?: string;
  @IsDateString() incidentDate: string;
  @IsOptional() incidentTime?: string;
  @IsOptional() location?: string;
  @IsNotEmpty() title: string;
  @IsNotEmpty() description: string;
  @IsOptional() @IsEnum(IncidentSeverity) severity?: IncidentSeverity;
  @IsOptional() witnesses?: string;
  @IsOptional() immediateAction?: string;
  @IsOptional() remarks?: string;
}

export class UpdateIncidentReportDto {
  @IsOptional() correctiveAction?: string;
  @IsOptional() @IsEnum(IncidentStatus) status?: IncidentStatus;
  @IsOptional() @IsDateString() resolvedDate?: string;
  @IsOptional() remarks?: string;
}

export class QueryIncidentReportDto {
  @IsOptional() involvedEmployeeId?: string;
  @IsOptional() @IsEnum(IncidentSeverity) severity?: IncidentSeverity;
  @IsOptional() @IsEnum(IncidentStatus) status?: IncidentStatus;
  @IsOptional() search?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

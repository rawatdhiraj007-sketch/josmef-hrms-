import { IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { AttendanceType } from '@common/enums';

export class CreateAttendanceDto {
  @IsNotEmpty() employeeId: string;
  @IsDateString() date: string;
  @IsOptional() timeIn?: string;
  @IsOptional() timeOut?: string;
  @IsOptional() breakStart?: string;
  @IsOptional() breakEnd?: string;
  @IsOptional() @IsEnum(AttendanceType) status?: AttendanceType;
  @IsOptional() hoursWorked?: number;
  @IsOptional() overtimeHours?: number;
  @IsOptional() lateMinutes?: number;
  @IsOptional() undertimeMinutes?: number;
  @IsOptional() latitudeIn?: number;
  @IsOptional() longitudeIn?: number;
  @IsOptional() latitudeOut?: number;
  @IsOptional() longitudeOut?: number;
  @IsOptional() source?: string;
  @IsOptional() rfidTag?: string;
  @IsOptional() location?: string;
  @IsOptional() remarks?: string;
}

export class ClockInDto {
  @IsNotEmpty() employeeId: string;
  @IsOptional() latitudeIn?: number;
  @IsOptional() longitudeIn?: number;
  @IsOptional() source?: string;
  @IsOptional() rfidTag?: string;
  @IsOptional() location?: string;
}

export class ClockOutDto {
  @IsNotEmpty() attendanceId: string;
  @IsOptional() latitudeOut?: number;
  @IsOptional() longitudeOut?: number;
}

export class UpdateAttendanceDto {
  @IsOptional() timeIn?: string;
  @IsOptional() timeOut?: string;
  @IsOptional() breakStart?: string;
  @IsOptional() breakEnd?: string;
  @IsOptional() @IsEnum(AttendanceType) status?: AttendanceType;
  @IsOptional() hoursWorked?: number;
  @IsOptional() overtimeHours?: number;
  @IsOptional() lateMinutes?: number;
  @IsOptional() undertimeMinutes?: number;
  @IsOptional() remarks?: string;
  @IsOptional() isApproved?: boolean;
}

export class QueryAttendanceDto {
  @IsOptional() employeeId?: string;
  @IsOptional() dateFrom?: string;
  @IsOptional() dateTo?: string;
  @IsOptional() @IsEnum(AttendanceType) status?: AttendanceType;
  @IsOptional() department?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

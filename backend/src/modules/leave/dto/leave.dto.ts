import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, IsEnum, IsUUID, Min } from 'class-validator';
import { LeaveStatus } from '../entities/leave-request.entity';

export class CreateLeaveTypeDto {
  @IsString() code: string;
  @IsString() name: string;
  @IsNumber() @Min(0) annualEntitlement: number;
  @IsOptional() @IsBoolean() isPaid?: boolean;
  @IsOptional() @IsBoolean() requiresApproval?: boolean;
  @IsOptional() @IsString() description?: string;
}

export class UpdateLeaveTypeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsNumber() @Min(0) annualEntitlement?: number;
  @IsOptional() @IsBoolean() isPaid?: boolean;
  @IsOptional() @IsBoolean() requiresApproval?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() description?: string;
}

export class CreateLeaveRequestDto {
  @IsUUID() employeeId: string;
  @IsUUID() leaveTypeId: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsString() reason: string;
  @IsOptional() @IsString() attachmentUrl?: string;
}

export class UpdateLeaveRequestDto {
  @IsOptional() @IsEnum(LeaveStatus) status?: LeaveStatus;
  @IsOptional() @IsString() approverRemarks?: string;
}

export class SetBalanceDto {
  @IsUUID() employeeId: string;
  @IsUUID() leaveTypeId: string;
  @IsNumber() year: number;
  @IsNumber() entitled: number;
}

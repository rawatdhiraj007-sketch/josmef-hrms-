import { IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PayrollStatus } from '../entities/payroll.entity';

export class GeneratePayrollDto {
  @IsDateString() payDateFrom: string;
  @IsDateString() payDateTo: string;
  @IsOptional() department?: string;
  @IsOptional() employeeId?: string;
}

export class UpdatePayrollDto {
  @IsOptional() overtimePay?: number;
  @IsOptional() holidayPay?: number;
  @IsOptional() nightDiffPay?: number;
  @IsOptional() allowance?: number;
  @IsOptional() otherEarnings?: number;
  @IsOptional() loanDeduction?: number;
  @IsOptional() otherDeductions?: number;
  @IsOptional() @IsEnum(PayrollStatus) status?: PayrollStatus;
  @IsOptional() remarks?: string;
}

export class QueryPayrollDto {
  @IsOptional() employeeId?: string;
  @IsOptional() payPeriod?: string;
  @IsOptional() @IsEnum(PayrollStatus) status?: PayrollStatus;
  @IsOptional() department?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

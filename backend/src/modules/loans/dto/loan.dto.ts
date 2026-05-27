import { IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { LoanType, LoanStatus } from '../entities/loan.entity';

export class CreateLoanDto {
  @IsNotEmpty() employeeId: string;
  @IsEnum(LoanType) loanType: LoanType;
  @IsOptional() loanReference?: string;
  @IsNotEmpty() principalAmount: number;
  @IsOptional() monthlyAmortization?: number;
  @IsOptional() @IsDateString() loanDate?: string;
  @IsOptional() @IsDateString() firstPaymentDate?: string;
  @IsOptional() @IsDateString() targetPayoffDate?: string;
  @IsOptional() interestRate?: number;
  @IsOptional() termMonths?: number;
  @IsOptional() purpose?: string;
  @IsOptional() remarks?: string;
}

export class UpdateLoanDto {
  @IsOptional() outstandingBalance?: number;
  @IsOptional() monthlyAmortization?: number;
  @IsOptional() @IsDateString() targetPayoffDate?: string;
  @IsOptional() @IsEnum(LoanStatus) status?: LoanStatus;
  @IsOptional() remarks?: string;
}

export class QueryLoanDto {
  @IsOptional() employeeId?: string;
  @IsOptional() @IsEnum(LoanType) loanType?: LoanType;
  @IsOptional() @IsEnum(LoanStatus) status?: LoanStatus;
  @IsOptional() search?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

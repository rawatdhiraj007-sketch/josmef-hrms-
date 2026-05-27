import { IsNotEmpty, IsEmail, IsOptional, IsEnum, IsDateString, IsNumberString } from 'class-validator';
import { ApplicantStatus } from '@common/enums';

export class CreateApplicantDto {
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  middleName?: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  mobile: string;

  @IsDateString()
  dateOfBirth: string;

  @IsNotEmpty()
  gender: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  province?: string;

  @IsOptional()
  zipCode?: string;

  @IsNotEmpty()
  positionApplied: string;

  @IsOptional()
  department?: string;

  @IsOptional()
  sourceChannel?: string;

  @IsOptional()
  @IsEnum(ApplicantStatus)
  status?: ApplicantStatus;

  @IsOptional()
  @IsDateString()
  applicationDate?: string;

  @IsOptional()
  @IsDateString()
  interviewDate?: string;

  @IsOptional()
  notes?: string;

  @IsOptional()
  resumeUrl?: string;

  @IsOptional()
  expectedSalary?: number;

  @IsOptional()
  referredBy?: string;
}

export class UpdateApplicantDto {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  middleName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  mobile?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  gender?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  province?: string;

  @IsOptional()
  zipCode?: string;

  @IsOptional()
  positionApplied?: string;

  @IsOptional()
  department?: string;

  @IsOptional()
  sourceChannel?: string;

  @IsOptional()
  @IsEnum(ApplicantStatus)
  status?: ApplicantStatus;

  @IsOptional()
  @IsDateString()
  applicationDate?: string;

  @IsOptional()
  @IsDateString()
  interviewDate?: string;

  @IsOptional()
  notes?: string;

  @IsOptional()
  resumeUrl?: string;

  @IsOptional()
  expectedSalary?: number;

  @IsOptional()
  referredBy?: string;
}

export class QueryApplicantDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsEnum(ApplicantStatus)
  status?: ApplicantStatus;

  @IsOptional()
  department?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

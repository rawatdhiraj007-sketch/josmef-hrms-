import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsUUID, Min } from 'class-validator';
import { LicenseType, LicenseStatus } from '../entities/license.entity';

export class CreateLicenseDto {
  @IsUUID() employeeId: string;
  @IsEnum(LicenseType) licenseType: LicenseType;
  @IsOptional() @IsString() customTypeLabel?: string;
  @IsString() licenseNumber: string;
  @IsOptional() @IsString() issuingAuthority?: string;
  @IsOptional() @IsString() countryCode?: string;
  @IsOptional() @IsDateString() issueDate?: string;
  @IsDateString() expiryDate: string;
  @IsOptional() @IsEnum(LicenseStatus) status?: LicenseStatus;
  @IsOptional() @IsNumber() @Min(0) cpdUnits?: number;
  @IsOptional() @IsNumber() @Min(0) cpdRequired?: number;
  @IsOptional() @IsString() verificationUrl?: string;
  @IsOptional() @IsString() documentUrl?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateLicenseDto {
  @IsOptional() @IsEnum(LicenseType) licenseType?: LicenseType;
  @IsOptional() @IsString() customTypeLabel?: string;
  @IsOptional() @IsString() licenseNumber?: string;
  @IsOptional() @IsString() issuingAuthority?: string;
  @IsOptional() @IsString() countryCode?: string;
  @IsOptional() @IsDateString() issueDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsEnum(LicenseStatus) status?: LicenseStatus;
  @IsOptional() @IsNumber() @Min(0) cpdUnits?: number;
  @IsOptional() @IsNumber() @Min(0) cpdRequired?: number;
  @IsOptional() @IsString() verificationUrl?: string;
  @IsOptional() @IsString() documentUrl?: string;
  @IsOptional() @IsString() notes?: string;
}

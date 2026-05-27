import { IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { CertificateType, CertificateStatus } from '../entities/work-certificate.entity';

export class CreateWorkCertificateDto {
  @IsNotEmpty() employeeId: string;
  @IsEnum(CertificateType) certificateType: CertificateType;
  @IsDateString() requestDate: string;
  @IsOptional() purpose?: string;
  @IsOptional() addressedTo?: string;
  @IsOptional() remarks?: string;
}

export class UpdateWorkCertificateDto {
  @IsOptional() @IsEnum(CertificateStatus) status?: CertificateStatus;
  @IsOptional() @IsDateString() releaseDate?: string;
  @IsOptional() releasedBy?: string;
  @IsOptional() remarks?: string;
}

export class QueryWorkCertificateDto {
  @IsOptional() employeeId?: string;
  @IsOptional() @IsEnum(CertificateType) certificateType?: CertificateType;
  @IsOptional() @IsEnum(CertificateStatus) status?: CertificateStatus;
  @IsOptional() search?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

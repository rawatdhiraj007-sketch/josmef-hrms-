import { IsNotEmpty, IsEmail, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { EmploymentStatus } from '@common/enums';

export class CreateEmployeeDto {
  @IsOptional() employeeId?: string; // Auto-generated as EMP-YYYY-NNN if not provided
  @IsNotEmpty() firstName: string;
  @IsOptional() middleName?: string;
  @IsNotEmpty() lastName: string;
  @IsOptional() suffix?: string;
  @IsEmail() email: string;
  @IsNotEmpty() mobile: string;
  @IsOptional() telephone?: string;
  @IsDateString() dateOfBirth: string;
  @IsNotEmpty() gender: string;
  @IsOptional() civilStatus?: string;
  @IsOptional() nationality?: string;
  @IsOptional() religion?: string;
  @IsOptional() presentAddress?: string;
  @IsOptional() permanentAddress?: string;
  @IsOptional() city?: string;
  @IsOptional() province?: string;
  @IsOptional() zipCode?: string;
  @IsOptional() sssNumber?: string;
  @IsOptional() philhealthNumber?: string;
  @IsOptional() pagibigNumber?: string;
  @IsOptional() tinNumber?: string;
  @IsNotEmpty() position: string;
  @IsNotEmpty() department: string;
  @IsOptional() branch?: string;
  @IsOptional() client?: string;
  @IsDateString() dateHired: string;
  @IsOptional() @IsDateString() dateRegularized?: string;
  @IsOptional() @IsDateString() contractEndDate?: string;
  @IsOptional() @IsDateString() dateSeparated?: string;
  @IsOptional() @IsEnum(EmploymentStatus) employmentStatus?: EmploymentStatus;
  @IsOptional() employmentType?: string;
  @IsOptional() payrollType?: string;
  @IsOptional() basicSalary?: number;
  @IsOptional() dailyRate?: number;
  @IsOptional() allowance?: number;
  @IsOptional() emergencyContactName?: string;
  @IsOptional() emergencyContactRelation?: string;
  @IsOptional() emergencyContactPhone?: string;
  @IsOptional() photoUrl?: string;
  @IsOptional() remarks?: string;
  @IsOptional() traineeId?: string;
  @IsOptional() applicantId?: string;
}

export class UpdateEmployeeDto {
  @IsOptional() employeeId?: string;
  @IsOptional() firstName?: string;
  @IsOptional() middleName?: string;
  @IsOptional() lastName?: string;
  @IsOptional() suffix?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() mobile?: string;
  @IsOptional() telephone?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() gender?: string;
  @IsOptional() civilStatus?: string;
  @IsOptional() nationality?: string;
  @IsOptional() religion?: string;
  @IsOptional() presentAddress?: string;
  @IsOptional() permanentAddress?: string;
  @IsOptional() city?: string;
  @IsOptional() province?: string;
  @IsOptional() zipCode?: string;
  @IsOptional() sssNumber?: string;
  @IsOptional() philhealthNumber?: string;
  @IsOptional() pagibigNumber?: string;
  @IsOptional() tinNumber?: string;
  @IsOptional() position?: string;
  @IsOptional() department?: string;
  @IsOptional() branch?: string;
  @IsOptional() client?: string;
  @IsOptional() @IsDateString() dateHired?: string;
  @IsOptional() @IsDateString() dateRegularized?: string;
  @IsOptional() @IsDateString() contractEndDate?: string;
  @IsOptional() @IsDateString() dateSeparated?: string;
  @IsOptional() @IsEnum(EmploymentStatus) employmentStatus?: EmploymentStatus;
  @IsOptional() employmentType?: string;
  @IsOptional() payrollType?: string;
  @IsOptional() basicSalary?: number;
  @IsOptional() dailyRate?: number;
  @IsOptional() allowance?: number;
  @IsOptional() emergencyContactName?: string;
  @IsOptional() emergencyContactRelation?: string;
  @IsOptional() emergencyContactPhone?: string;
  @IsOptional() photoUrl?: string;
  @IsOptional() remarks?: string;
}

export class QueryEmployeeDto {
  @IsOptional() search?: string;
  @IsOptional() @IsEnum(EmploymentStatus) employmentStatus?: EmploymentStatus;
  @IsOptional() department?: string;
  @IsOptional() branch?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

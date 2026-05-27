import { IsNotEmpty, IsOptional } from 'class-validator';

export class ResumeParseDto {
  @IsNotEmpty()
  resumeText: string;
}

export class HrChatDto {
  @IsNotEmpty()
  message: string;

  @IsOptional()
  context?: string;
}

export class EmployeeInsightDto {
  @IsNotEmpty()
  employeeId: string;
}

export class JobDescriptionDto {
  @IsNotEmpty()
  position: string;

  @IsOptional()
  department?: string;

  @IsOptional()
  requirements?: string;
}

export class PerformanceReviewDto {
  @IsNotEmpty()
  employeeName: string;

  @IsNotEmpty()
  position: string;

  @IsOptional()
  period?: string;

  @IsOptional()
  strengths?: string;

  @IsOptional()
  improvements?: string;

  @IsOptional()
  goals?: string;
}

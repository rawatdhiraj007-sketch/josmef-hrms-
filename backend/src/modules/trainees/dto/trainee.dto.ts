import { IsNotEmpty, IsEmail, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TraineeStatus } from '../entities/trainee.entity';

export class CreateTraineeDto {
  @IsOptional()
  applicantId?: string;

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

  @IsNotEmpty()
  positionApplied: string;

  @IsOptional()
  department?: string;

  @IsOptional()
  trainingProgram?: string;

  @IsOptional()
  trainingLocation?: string;

  @IsDateString()
  trainingStartDate: string;

  @IsOptional()
  @IsDateString()
  trainingEndDate?: string;

  @IsOptional()
  trainer?: string;

  @IsOptional()
  @IsEnum(TraineeStatus)
  status?: TraineeStatus;

  @IsOptional()
  examScore?: number;

  @IsOptional()
  performanceRating?: number;

  @IsOptional()
  remarks?: string;

  @IsOptional()
  @IsDateString()
  deploymentDate?: string;

  @IsOptional()
  deploymentSite?: string;
}

export class UpdateTraineeDto {
  @IsOptional() firstName?: string;
  @IsOptional() middleName?: string;
  @IsOptional() lastName?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() mobile?: string;
  @IsOptional() positionApplied?: string;
  @IsOptional() department?: string;
  @IsOptional() trainingProgram?: string;
  @IsOptional() trainingLocation?: string;
  @IsOptional() @IsDateString() trainingStartDate?: string;
  @IsOptional() @IsDateString() trainingEndDate?: string;
  @IsOptional() trainer?: string;
  @IsOptional() @IsEnum(TraineeStatus) status?: TraineeStatus;
  @IsOptional() examScore?: number;
  @IsOptional() performanceRating?: number;
  @IsOptional() remarks?: string;
  @IsOptional() @IsDateString() deploymentDate?: string;
  @IsOptional() deploymentSite?: string;
}

export class QueryTraineeDto {
  @IsOptional() search?: string;
  @IsOptional() @IsEnum(TraineeStatus) status?: TraineeStatus;
  @IsOptional() department?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

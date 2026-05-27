export interface Trainee {
  id: string;
  applicantId?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  positionApplied: string;
  department?: string;
  trainingProgram?: string;
  trainingLocation?: string;
  trainingStartDate: string;
  trainingEndDate?: string;
  trainer?: string;
  status: TraineeStatusEnum;
  examScore?: number;
  performanceRating?: number;
  remarks?: string;
  deploymentDate?: string;
  deploymentSite?: string;
  createdAt: string;
}

export enum TraineeStatusEnum {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DROPPED = 'dropped',
  FOR_DEPLOYMENT = 'for_deployment',
  DEPLOYED = 'deployed',
}

export interface TraineeListResponse {
  data: Trainee[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface Applicant {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  positionApplied: string;
  department?: string;
  sourceChannel?: string;
  status: ApplicantStatus;
  applicationDate?: string;
  interviewDate?: string;
  notes?: string;
  resumeUrl?: string;
  expectedSalary?: number;
  referredBy?: string;
  createdAt: string;
}

export enum ApplicantStatus {
  NEW = 'new',
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  EXAM = 'exam',
  FOR_REQUIREMENTS = 'for_requirements',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  POOLED = 'pooled',
  WITHDRAWN = 'withdrawn',
}

export interface ApplicantListResponse {
  data: Applicant[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

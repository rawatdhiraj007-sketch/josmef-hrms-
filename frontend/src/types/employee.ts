export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix?: string;
  email: string;
  mobile: string;
  telephone?: string;
  dateOfBirth: string;
  gender: string;
  civilStatus?: string;
  nationality?: string;
  religion?: string;
  presentAddress?: string;
  permanentAddress?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  sssNumber?: string;
  philhealthNumber?: string;
  pagibigNumber?: string;
  tinNumber?: string;
  position: string;
  department: string;
  branch?: string;
  client?: string;
  dateHired: string;
  dateRegularized?: string;
  contractEndDate?: string;
  dateSeparated?: string;
  employmentStatus: string;
  employmentType?: string;
  payrollType?: string;
  basicSalary: number;
  dailyRate: number;
  allowance: number;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  photoUrl?: string;
  remarks?: string;
  createdAt: string;
}

export enum EmploymentStatus {
  APPLICANT = 'applicant',
  TRAINEE = 'trainee',
  PROBATIONARY = 'probationary',
  REGULAR = 'regular',
  RESIGNED = 'resigned',
  TERMINATED = 'terminated',
  END_OF_CONTRACT = 'end_of_contract',
  AWOL = 'awol',
}

export interface Document201 {
  id: string;
  employeeId: string;
  documentName: string;
  category: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  documentDate?: string;
  expiryDate?: string;
  isVerified: boolean;
  verifiedBy?: string;
  remarks?: string;
  createdAt: string;
}

export enum DocumentCategory {
  PRE_EMPLOYMENT = 'pre_employment',
  CONTRACT = 'contract',
  GOVERNMENT = 'government',
  MEDICAL = 'medical',
  DISCIPLINARY = 'disciplinary',
  PERFORMANCE = 'performance',
  TRAINING = 'training',
  CERTIFICATION = 'certification',
  SEPARATION = 'separation',
  OTHER = 'other',
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

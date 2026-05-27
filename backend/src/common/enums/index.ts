export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  HR_ADMIN = 'hr_admin',
  HR_STAFF = 'hr_staff',
  PAYROLL_ADMIN = 'payroll_admin',
  RECRUITMENT = 'recruitment',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer',
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

export enum AttendanceType {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  LEAVE = 'leave',
  HOLIDAY = 'holiday',
  REST_DAY = 'rest_day',
  OT = 'overtime',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

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

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string[];
  timestamp: string;
}

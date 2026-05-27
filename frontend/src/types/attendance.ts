export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employee?: { id: string; employeeId: string; firstName: string; lastName: string; department: string; position: string };
  date: string;
  timeIn?: string;
  timeOut?: string;
  status: string;
  hoursWorked: number;
  overtimeHours: number;
  lateMinutes: number;
  undertimeMinutes: number;
  source: string;
  location?: string;
  isApproved: boolean;
  remarks?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employee?: { id: string; employeeId: string; firstName: string; lastName: string; department: string; position: string };
  payPeriod: string;
  payDateFrom: string;
  payDateTo: string;
  basicPay: number;
  overtimePay: number;
  holidayPay: number;
  nightDiffPay: number;
  allowance: number;
  otherEarnings: number;
  grossPay: number;
  sssContribution: number;
  philhealthContribution: number;
  pagibigContribution: number;
  withholdingTax: number;
  lateDeduction: number;
  absentDeduction: number;
  loanDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  daysWorked: number;
  daysAbsent: number;
  totalOvertimeHours: number;
  totalLateMinutes: number;
  status: string;
  remarks?: string;
  createdAt: string;
}

export interface ListResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

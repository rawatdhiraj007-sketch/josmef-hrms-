export interface ExitClearance {
  id: string;
  employeeId: string;
  employee?: { id: string; employeeId: string; firstName: string; lastName: string; department: string; position: string };
  separationType: string;
  lastWorkingDay: string;
  resignationDate?: string;
  effectiveDate?: string;
  reason?: string;
  status: string;
  completedDate?: string;
  remarks?: string;
  finalPay: number;
  finalPayReleased: boolean;
  items: ClearanceItem[];
  createdAt: string;
}

export interface ClearanceItem {
  id: string;
  clearanceId: string;
  department: string;
  requirement: string;
  isCleared: boolean;
  clearedBy?: string;
  clearedAt?: string;
  remarks?: string;
}

export enum SeparationType {
  RESIGNATION = 'resignation',
  TERMINATION = 'termination',
  END_OF_CONTRACT = 'end_of_contract',
  RETIREMENT = 'retirement',
  AWOL = 'awol',
  REDUNDANCY = 'redundancy',
}

export enum ClearanceStatusEnum {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

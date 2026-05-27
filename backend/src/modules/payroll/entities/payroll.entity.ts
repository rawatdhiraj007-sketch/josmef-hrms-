import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum PayrollStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  RELEASED = 'released',
  CANCELLED = 'cancelled',
}

@Entity('payroll')
export class Payroll extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ length: 50 })
  payPeriod: string; // e.g. "2025-01-01_2025-01-15"

  @Column({ type: 'date' })
  payDateFrom: Date;

  @Column({ type: 'date' })
  payDateTo: Date;

  @Column({ type: 'date', nullable: true })
  payDay: Date;

  // Earnings
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  basicPay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtimePay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  holidayPay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  nightDiffPay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  allowance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  otherEarnings: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  grossPay: number;

  // Deductions - Statutory
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sssContribution: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  philhealthContribution: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pagibigContribution: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  withholdingTax: number;

  // Deductions - Others
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lateDeduction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  absentDeduction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  loanDeduction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  otherDeductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  netPay: number;

  // Attendance summary
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  daysWorked: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  daysAbsent: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalOvertimeHours: number;

  @Column({ type: 'decimal', precision: 7, scale: 2, default: 0 })
  totalLateMinutes: number;

  @Column({ type: 'enum', enum: PayrollStatus, default: PayrollStatus.DRAFT })
  status: PayrollStatus;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;
}

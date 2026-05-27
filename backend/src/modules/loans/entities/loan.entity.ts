import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum LoanType {
  SSS = 'sss',
  PAGIBIG = 'pagibig',
  COMPANY = 'company',
  CASH_ADVANCE = 'cash_advance',
  OTHER = 'other',
}

export enum LoanStatus {
  ACTIVE = 'active',
  FULLY_PAID = 'fully_paid',
  CANCELLED = 'cancelled',
  DEFAULTED = 'defaulted',
}

@Entity('loans')
export class Loan extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'enum', enum: LoanType, default: LoanType.COMPANY })
  loanType: LoanType;

  @Column({ length: 100, nullable: true })
  loanReference: string; // SSS/Pag-IBIG loan reference number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  principalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyAmortization: number;

  @Column({ type: 'date', nullable: true })
  loanDate: Date;

  @Column({ type: 'date', nullable: true })
  firstPaymentDate: Date;

  @Column({ type: 'date', nullable: true })
  targetPayoffDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  interestRate: number;

  @Column({ type: 'int', default: 0 })
  termMonths: number;

  @Column({ type: 'enum', enum: LoanStatus, default: LoanStatus.ACTIVE })
  status: LoanStatus;

  @Column({ type: 'text', nullable: true })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;
}

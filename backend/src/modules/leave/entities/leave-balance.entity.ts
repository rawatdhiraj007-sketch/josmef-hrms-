import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { LeaveType } from './leave-type.entity';

@Entity('leave_balances')
@Unique(['employeeId', 'leaveTypeId', 'year'])
export class LeaveBalance extends BaseEntity {
  @Index()
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  leaveTypeId: string;

  @ManyToOne(() => LeaveType, { eager: true })
  @JoinColumn({ name: 'leaveTypeId' })
  leaveType: LeaveType;

  @Index()
  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  entitled: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  used: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  pending: number; // days currently in PENDING requests

  // remaining = entitled - used - pending (computed)
}

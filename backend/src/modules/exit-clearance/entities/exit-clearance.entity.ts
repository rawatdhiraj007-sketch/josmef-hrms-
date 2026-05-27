import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum ClearanceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SeparationType {
  RESIGNATION = 'resignation',
  TERMINATION = 'termination',
  END_OF_CONTRACT = 'end_of_contract',
  RETIREMENT = 'retirement',
  AWOL = 'awol',
  REDUNDANCY = 'redundancy',
}

@Entity('exit_clearance')
export class ExitClearance extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'enum', enum: SeparationType })
  separationType: SeparationType;

  @Column({ type: 'date' })
  lastWorkingDay: Date;

  @Column({ type: 'date', nullable: true })
  resignationDate: Date;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'enum', enum: ClearanceStatus, default: ClearanceStatus.PENDING })
  status: ClearanceStatus;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  finalPay: number;

  @Column({ default: false })
  finalPayReleased: boolean;

  @OneToMany(() => ClearanceItem, (item) => item.clearance, { cascade: true, eager: true })
  items: ClearanceItem[];
}

@Entity('clearance_items')
export class ClearanceItem extends BaseEntity {
  @Column()
  clearanceId: string;

  @ManyToOne(() => ExitClearance, (c) => c.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clearanceId' })
  clearance: ExitClearance;

  @Column({ length: 100 })
  department: string;

  @Column({ length: 255 })
  requirement: string;

  @Column({ default: false })
  isCleared: boolean;

  @Column({ nullable: true })
  clearedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  clearedAt: Date;

  @Column({ type: 'text', nullable: true })
  remarks: string;
}

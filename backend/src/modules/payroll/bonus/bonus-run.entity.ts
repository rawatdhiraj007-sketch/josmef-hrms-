import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum BonusType {
  THIRTEENTH_MONTH = '13th_month',
  PERFORMANCE = 'performance',
  CHRISTMAS = 'christmas',
  COMMISSION = 'commission',
  SIGNING = 'signing',
  RETENTION = 'retention',
  OTHER = 'other',
}

export enum BonusRunStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  RELEASED = 'released',
  CANCELLED = 'cancelled',
}

@Entity('bonus_runs')
export class BonusRun extends BaseEntity {
  @Column({ length: 50, unique: true, nullable: true })
  runNumber: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'enum', enum: BonusType })
  type: BonusType;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'date' })
  payoutDate: Date;

  @Column({ type: 'enum', enum: BonusRunStatus, default: BonusRunStatus.DRAFT })
  status: BonusRunStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'int', default: 0 })
  totalEmployees: number;

  @OneToMany(() => BonusItem, (i) => i.run, { cascade: true })
  items: BonusItem[];
}

@Entity('bonus_items')
export class BonusItem extends BaseEntity {
  @Column()
  runId: string;

  @ManyToOne(() => BonusRun, (r) => r.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'runId' })
  run: BonusRun;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  basis: number; // e.g. total annual basic pay used for 13th month calc

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  remarks: string;
}

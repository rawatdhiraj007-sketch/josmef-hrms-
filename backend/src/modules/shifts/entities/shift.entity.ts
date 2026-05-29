import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

/**
 * Shift template — defines a type of shift (Day 7-3, Night 11-7, etc.)
 * that can be assigned to employees on specific dates.
 */
export enum ShiftType {
  REGULAR = 'regular',
  ON_CALL = 'on_call',
  OVERTIME = 'overtime',
  HOLIDAY = 'holiday',
  TRAINING = 'training',
  REST_DAY = 'rest_day',
}

@Entity('shift_templates')
export class ShiftTemplate extends BaseEntity {
  @Column({ length: 100 })
  name: string; // e.g. "Day Shift", "Night Shift", "12-Hour Day"

  @Column({ length: 30, nullable: true })
  code: string; // e.g. "D", "N", "12D"

  @Column({ type: 'time' })
  startTime: string; // "07:00:00"

  @Column({ type: 'time' })
  endTime: string; // "15:00:00"

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 8 })
  hoursPerShift: number;

  // Pay differentials
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  payMultiplier: number; // 1.0 = base, 1.1 = +10% night diff, 2.0 = double for holiday

  @Column({ default: false })
  isNightShift: boolean;

  // Required skills/certifications for this shift
  @Column({ type: 'simple-array', nullable: true })
  requiredCertifications: string[]; // ['bls', 'acls'] or ['icu_certified']

  @Column({ length: 100, nullable: true })
  department: string; // ICU, ER, Med-Surg, etc.

  @Column({ length: 50, nullable: true })
  unit: string; // sub-department / ward

  // Patient-ratio compliance
  @Column({ type: 'int', nullable: true })
  maxPatientsPerStaff: number; // e.g. 4 for ICU, 6 for med-surg

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 7, default: '#3b82f6' })
  color: string; // hex color for calendar UI
}

export enum ShiftAssignmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CALLED_OUT = 'called_out',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  SWAPPED = 'swapped',
  CANCELLED = 'cancelled',
}

/**
 * One shift assignment = a specific employee scheduled for a specific date + shift.
 */
@Entity('shift_assignments')
@Index(['employeeId', 'shiftDate'])
@Index(['shiftDate'])
export class ShiftAssignment extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  shiftTemplateId: string;

  @ManyToOne(() => ShiftTemplate, { eager: true })
  @JoinColumn({ name: 'shiftTemplateId' })
  shiftTemplate: ShiftTemplate;

  @Column({ type: 'date' })
  shiftDate: Date;

  @Column({ type: 'enum', enum: ShiftAssignmentStatus, default: ShiftAssignmentStatus.SCHEDULED })
  status: ShiftAssignmentStatus;

  @Column({ type: 'enum', enum: ShiftType, default: ShiftType.REGULAR })
  shiftType: ShiftType;

  // Override times if different from template
  @Column({ type: 'time', nullable: true })
  actualStartTime: string;

  @Column({ type: 'time', nullable: true })
  actualEndTime: string;

  @Column({ length: 100, nullable: true })
  unit: string; // override template's unit

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Swap request linkage
  @Column({ nullable: true })
  swappedWithAssignmentId: string;

  @OneToMany(() => SwapRequest, (s) => s.fromAssignment)
  swapRequests: SwapRequest[];
}

export enum SwapRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('shift_swap_requests')
export class SwapRequest extends BaseEntity {
  @Column()
  fromAssignmentId: string;

  @ManyToOne(() => ShiftAssignment, (a) => a.swapRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromAssignmentId' })
  fromAssignment: ShiftAssignment;

  @Column()
  requestedByEmployeeId: string;

  @Column({ nullable: true })
  targetEmployeeId: string; // optional — open swap is null

  @Column({ type: 'enum', enum: SwapRequestStatus, default: SwapRequestStatus.PENDING })
  status: SwapRequestStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ length: 100, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;
}

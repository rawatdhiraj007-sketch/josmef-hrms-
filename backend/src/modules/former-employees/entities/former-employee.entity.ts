import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

export enum SeparationReason {
  RESIGNED = 'resigned',
  TERMINATED = 'terminated',
  END_OF_CONTRACT = 'end_of_contract',
  RETIRED = 'retired',
  AWOL = 'awol',
  REDUNDANCY = 'redundancy',
  RETRENCHMENT = 'retrenchment',
  DEATH = 'death',
  OTHER = 'other',
}

@Entity('former_employees')
export class FormerEmployee extends BaseEntity {
  @Column({ length: 20, nullable: true, unique: true })
  formerEmployeeNumber: string; // FMR-YYYY-NNN

  @Column({ nullable: true })
  originalEmployeeId: string; // UUID reference to employees table

  @Column({ length: 30, nullable: true })
  employeeId: string; // EMP-YYYY-NNN

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100, default: '' })
  middleName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 10, nullable: true })
  suffix: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20 })
  mobile: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ length: 20, nullable: true })
  civilStatus: string;

  // Government IDs
  @Column({ length: 30, nullable: true })
  sssNumber: string;

  @Column({ length: 30, nullable: true })
  philhealthNumber: string;

  @Column({ length: 30, nullable: true })
  pagibigNumber: string;

  @Column({ length: 30, nullable: true })
  tinNumber: string;

  // Employment Details
  @Column({ length: 150 })
  position: string;

  @Column({ length: 100 })
  department: string;

  @Column({ length: 100, nullable: true })
  branch: string;

  @Column({ type: 'date', nullable: true })
  dateHired: Date;

  @Column({ type: 'date', nullable: true })
  dateSeparated: Date;

  @Column({ type: 'enum', enum: SeparationReason, default: SeparationReason.RESIGNED })
  separationReason: SeparationReason;

  @Column({ type: 'text', nullable: true })
  separationDetails: string;

  // Compensation at time of separation
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  lastSalary: number;

  // Clearance
  @Column({ default: false })
  clearanceCompleted: boolean;

  @Column({ type: 'date', nullable: true })
  clearanceDate: Date;

  // 13th month / Last pay
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  finalPay: number;

  @Column({ default: false })
  finalPayReleased: boolean;

  @Column({ type: 'date', nullable: true })
  finalPayReleaseDate: Date;

  @Column({ type: 'text', nullable: true })
  remarks: string;
}

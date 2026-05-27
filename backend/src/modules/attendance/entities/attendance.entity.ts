import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { AttendanceType } from '@common/enums';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('attendance')
export class Attendance extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', nullable: true })
  timeIn: string;

  @Column({ type: 'time', nullable: true })
  timeOut: string;

  @Column({ type: 'time', nullable: true })
  breakStart: string;

  @Column({ type: 'time', nullable: true })
  breakEnd: string;

  @Column({ type: 'enum', enum: AttendanceType, default: AttendanceType.PRESENT })
  status: AttendanceType;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  hoursWorked: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  lateMinutes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  undertimeMinutes: number;

  // Geo-location
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitudeIn: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitudeIn: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitudeOut: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitudeOut: number;

  // Source tracking
  @Column({ length: 30, default: 'manual' })
  source: string; // manual | rfid | geo | biometric

  @Column({ length: 100, nullable: true })
  rfidTag: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ nullable: true })
  approvedBy: string;
}

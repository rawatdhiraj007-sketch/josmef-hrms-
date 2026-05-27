import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { EmploymentStatus } from '@common/enums';

@Entity('employees')
export class Employee extends BaseEntity {
  @Column({ length: 30, unique: true })
  employeeId: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100, default: '' })
  middleName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 10, nullable: true })
  suffix: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20 })
  mobile: string;

  @Column({ length: 20, nullable: true })
  telephone: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ length: 10 })
  gender: string;

  @Column({ length: 20, nullable: true })
  civilStatus: string;

  @Column({ length: 50, nullable: true })
  nationality: string;

  @Column({ length: 50, nullable: true })
  religion: string;

  // Address
  @Column({ type: 'text', nullable: true })
  presentAddress: string;

  @Column({ type: 'text', nullable: true })
  permanentAddress: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  province: string;

  @Column({ length: 10, nullable: true })
  zipCode: string;

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

  @Column({ length: 100, nullable: true })
  client: string;

  @Column({ type: 'date' })
  dateHired: Date;

  @Column({ type: 'date', nullable: true })
  dateRegularized: Date;

  @Column({ type: 'date', nullable: true })
  contractEndDate: Date;

  @Column({ type: 'date', nullable: true })
  dateSeparated: Date;

  @Column({ type: 'enum', enum: EmploymentStatus, default: EmploymentStatus.PROBATIONARY })
  employmentStatus: EmploymentStatus;

  @Column({ length: 50, nullable: true })
  employmentType: string;

  @Column({ length: 50, nullable: true })
  payrollType: string;

  // Compensation
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dailyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  allowance: number;

  // Emergency Contact
  @Column({ length: 150, nullable: true })
  emergencyContactName: string;

  @Column({ length: 100, nullable: true })
  emergencyContactRelation: string;

  @Column({ length: 20, nullable: true })
  emergencyContactPhone: string;

  // Others
  @Column({ length: 255, nullable: true })
  photoUrl: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ nullable: true })
  traineeId: string;

  @Column({ nullable: true })
  applicantId: string;
}

import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { ApplicantStatus } from '@common/enums';

@Entity('applicants')
export class Applicant extends BaseEntity {
  @Column({ length: 20, nullable: true, unique: true })
  applicantNumber: string; // APP-YYYY-NNN

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  middleName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20 })
  mobile: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ length: 10 })
  gender: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  province: string;

  @Column({ length: 10, nullable: true })
  zipCode: string;

  @Column({ length: 150 })
  positionApplied: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ length: 100, nullable: true })
  sourceChannel: string;

  @Column({ type: 'enum', enum: ApplicantStatus, default: ApplicantStatus.NEW })
  status: ApplicantStatus;

  @Column({ type: 'date', nullable: true })
  applicationDate: Date;

  @Column({ type: 'date', nullable: true })
  interviewDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 255, nullable: true })
  resumeUrl: string;

  // Resume uploaded inline as base64 (PDF up to ~5MB)
  @Column({ type: 'text', nullable: true })
  resumeBase64: string;

  @Column({ length: 200, nullable: true })
  resumeFileName: string;

  @Column({ length: 100, nullable: true })
  resumeMimeType: string;

  @Column({ type: 'int', nullable: true })
  resumeSizeBytes: number;

  // Optional linkage to the JobOpening they applied for
  @Column({ length: 100, nullable: true })
  jobOpeningId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  expectedSalary: number;

  @Column({ length: 100, nullable: true })
  referredBy: string;
}

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum CertificateType {
  CERTIFICATE_OF_EMPLOYMENT = 'certificate_of_employment',
  CERTIFICATE_OF_EMPLOYMENT_WITH_COMPENSATION = 'coe_with_compensation',
  SERVICE_RECORD = 'service_record',
  SALARY_CERTIFICATION = 'salary_certification',
  GOOD_MORAL = 'good_moral',
  WORK_EXPERIENCE = 'work_experience',
  OTHER = 'other',
}

export enum CertificateStatus {
  REQUESTED = 'requested',
  PROCESSING = 'processing',
  RELEASED = 'released',
  CANCELLED = 'cancelled',
}

@Entity('work_certificates')
export class WorkCertificate extends BaseEntity {
  @Column({ length: 30, nullable: true, unique: true })
  certificateNumber: string; // CERT-YYYY-NNN

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'enum', enum: CertificateType })
  certificateType: CertificateType;

  @Column({ type: 'date' })
  requestDate: Date;

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ type: 'text', nullable: true })
  purpose: string; // What it's for (visa, bank loan, etc.)

  @Column({ length: 100, nullable: true })
  addressedTo: string;

  @Column({ type: 'enum', enum: CertificateStatus, default: CertificateStatus.REQUESTED })
  status: CertificateStatus;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ length: 150, nullable: true })
  releasedBy: string;
}

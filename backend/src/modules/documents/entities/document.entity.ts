import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum DocumentCategory {
  PRE_EMPLOYMENT = 'pre_employment',
  CONTRACT = 'contract',
  GOVERNMENT = 'government',
  MEDICAL = 'medical',
  DISCIPLINARY = 'disciplinary',
  PERFORMANCE = 'performance',
  TRAINING = 'training',
  CERTIFICATION = 'certification',
  SEPARATION = 'separation',
  OTHER = 'other',
}

@Entity('documents_201')
export class Document201 extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ length: 255 })
  documentName: string;

  @Column({ type: 'enum', enum: DocumentCategory, default: DocumentCategory.OTHER })
  category: DocumentCategory;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 500 })
  fileUrl: string;

  @Column({ length: 100, nullable: true })
  fileType: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ type: 'date', nullable: true })
  documentDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ length: 255, nullable: true })
  verifiedBy: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;
}

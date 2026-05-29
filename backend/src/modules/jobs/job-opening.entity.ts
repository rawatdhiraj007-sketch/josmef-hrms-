import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  PROBATIONARY = 'probationary',
  INTERN = 'intern',
}

@Entity('job_openings')
export class JobOpening extends BaseEntity {
  @Index()
  @Column({ length: 200 })
  title: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ length: 150, nullable: true })
  location: string;

  @Column({ type: 'enum', enum: EmploymentType, default: EmploymentType.FULL_TIME })
  employmentType: EmploymentType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  responsibilities: string[];

  @Column({ type: 'simple-array', nullable: true })
  qualifications: string[];

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salaryMin: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salaryMax: number;

  @Column({ default: 'PHP', length: 3 })
  currency: string;

  @Column({ type: 'date', nullable: true })
  postedDate: Date;

  @Column({ type: 'date', nullable: true })
  closingDate: Date;

  @Index()
  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  numberOfOpenings: number;

  @Column({ type: 'int', default: 0 })
  applicantCount: number; // computed/cached
}

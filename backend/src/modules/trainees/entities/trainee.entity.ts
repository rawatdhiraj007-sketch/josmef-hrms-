import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Applicant } from '../../applicants/entities/applicant.entity';

export enum TraineeStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DROPPED = 'dropped',
  FOR_DEPLOYMENT = 'for_deployment',
  DEPLOYED = 'deployed',
}

@Entity('trainees')
export class Trainee extends BaseEntity {
  @Column({ length: 20, nullable: true, unique: true })
  traineeNumber: string; // TRN-YYYY-NNN

  @Column({ nullable: true })
  applicantId: string;

  @ManyToOne(() => Applicant, { nullable: true, eager: false })
  @JoinColumn({ name: 'applicantId' })
  applicant: Applicant;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100, default: '' })
  middleName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20 })
  mobile: string;

  @Column({ length: 150 })
  positionApplied: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ length: 200, nullable: true })
  trainingProgram: string;

  @Column({ length: 200, nullable: true })
  trainingLocation: string;

  @Column({ type: 'date' })
  trainingStartDate: Date;

  @Column({ type: 'date', nullable: true })
  trainingEndDate: Date;

  @Column({ length: 150, nullable: true })
  trainer: string;

  @Column({ type: 'enum', enum: TraineeStatus, default: TraineeStatus.ONGOING })
  status: TraineeStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  examScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  performanceRating: number;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'date', nullable: true })
  deploymentDate: Date;

  @Column({ length: 200, nullable: true })
  deploymentSite: string;
}

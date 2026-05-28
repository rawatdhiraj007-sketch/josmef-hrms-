import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

export enum CourseProvider {
  GRAPHY = 'graphy',
  INTERNAL = 'internal',
  COURSERA = 'coursera',
  UDEMY = 'udemy',
  YOUTUBE = 'youtube',
  OTHER = 'other',
}

export enum CourseCategory {
  CLINICAL = 'clinical',
  COMPLIANCE = 'compliance',
  LEADERSHIP = 'leadership',
  SOFT_SKILLS = 'soft_skills',
  TECHNICAL = 'technical',
  SAFETY = 'safety',
  ONBOARDING = 'onboarding',
  OTHER = 'other',
}

@Entity('courses')
export class Course extends BaseEntity {
  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: CourseProvider, default: CourseProvider.GRAPHY })
  provider: CourseProvider;

  @Column({ type: 'enum', enum: CourseCategory, default: CourseCategory.OTHER })
  category: CourseCategory;

  // External course URL (e.g. https://josmef.graphy.com/courses/xyz)
  @Column({ type: 'text', nullable: true })
  url: string;

  // Optional Graphy course ID for deeper integration later
  @Column({ length: 100, nullable: true })
  externalId: string;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'int', default: 0 })
  durationMinutes: number;

  @Column({ default: false })
  isMandatory: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  issuesCertificate: boolean;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[]; // e.g. ['Phlebotomy', 'Patient Care']

  @OneToMany(() => CourseEnrollment, (e) => e.course)
  enrollments: CourseEnrollment[];
}

export enum EnrollmentStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

import { ManyToOne, JoinColumn, Index } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('course_enrollments')
export class CourseEnrollment extends BaseEntity {
  @Index()
  @Column()
  courseId: string;

  @ManyToOne(() => Course, (c) => c.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Index()
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ASSIGNED })
  status: EnrollmentStatus;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', default: 0 })
  progressPercent: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  certificateUrl: string;

  @Column({ length: 100, nullable: true })
  certificateNumber: string;
}

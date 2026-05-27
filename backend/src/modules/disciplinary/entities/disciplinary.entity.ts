import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum DisciplinaryType {
  VERBAL_WARNING = 'verbal_warning',
  WRITTEN_WARNING = 'written_warning',
  SUSPENSION = 'suspension',
  DEMOTION = 'demotion',
  TERMINATION = 'termination',
}

export enum DisciplinaryStatus {
  OPEN = 'open',
  RESOLVED = 'resolved',
  APPEALED = 'appealed',
  DISMISSED = 'dismissed',
}

@Entity('disciplinary_actions')
export class DisciplinaryAction extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'enum', enum: DisciplinaryType })
  type: DisciplinaryType;

  @Column({ type: 'date' })
  incidentDate: Date;

  @Column({ type: 'date', nullable: true })
  actionDate: Date;

  @Column({ length: 255 })
  offense: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  actionTaken: string;

  @Column({ type: 'int', nullable: true })
  suspensionDays: number;

  @Column({ type: 'date', nullable: true })
  suspensionStartDate: Date;

  @Column({ type: 'date', nullable: true })
  suspensionEndDate: Date;

  @Column({ type: 'enum', enum: DisciplinaryStatus, default: DisciplinaryStatus.OPEN })
  status: DisciplinaryStatus;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ length: 150, nullable: true })
  issuedBy: string; // Name of the officer who issued
}

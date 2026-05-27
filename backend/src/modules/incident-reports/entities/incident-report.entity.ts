import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum IncidentStatus {
  REPORTED = 'reported',
  UNDER_INVESTIGATION = 'under_investigation',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('incident_reports')
export class IncidentReport extends BaseEntity {
  @Column({ length: 30, nullable: true, unique: true })
  reportNumber: string; // INC-YYYY-NNN

  @Column({ nullable: true })
  reportedByEmployeeId: string; // Who reported (may be same as involved)

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'reportedByEmployeeId' })
  reportedBy: Employee;

  @Column({ nullable: true })
  involvedEmployeeId: string; // Employee involved in the incident

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'involvedEmployeeId' })
  involvedEmployee: Employee;

  @Column({ type: 'date' })
  incidentDate: Date;

  @Column({ length: 100, nullable: true })
  incidentTime: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: IncidentSeverity, default: IncidentSeverity.MEDIUM })
  severity: IncidentSeverity;

  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.REPORTED })
  status: IncidentStatus;

  @Column({ type: 'text', nullable: true })
  witnesses: string; // Comma-separated or JSON

  @Column({ type: 'text', nullable: true })
  immediateAction: string;

  @Column({ type: 'text', nullable: true })
  correctiveAction: string;

  @Column({ type: 'date', nullable: true })
  resolvedDate: Date;

  @Column({ type: 'text', nullable: true })
  remarks: string;
}

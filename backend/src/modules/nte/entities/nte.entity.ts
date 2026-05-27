import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum NteStatus {
  ISSUED = 'issued',
  ACKNOWLEDGED = 'acknowledged',
  EXPLAINED = 'explained',
  CLOSED = 'closed',
}

@Entity('nte_records')
export class NteRecord extends BaseEntity {
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ length: 50, nullable: true, unique: true })
  nteNumber: string; // NTE-YYYY-NNN

  @Column({ type: 'date' })
  dateIssued: Date;

  @Column({ type: 'date', nullable: true })
  deadlineToReply: Date;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text' })
  description: string; // Detailed description of the offense

  @Column({ type: 'text', nullable: true })
  employeeExplanation: string;

  @Column({ type: 'date', nullable: true })
  explanationDate: Date;

  @Column({ type: 'enum', enum: NteStatus, default: NteStatus.ISSUED })
  status: NteStatus;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ length: 150, nullable: true })
  issuedBy: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;
}

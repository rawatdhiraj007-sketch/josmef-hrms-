import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SIGN = 'SIGN',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Index()
  @Column({ length: 100, nullable: true })
  userId: string;

  @Column({ length: 200, nullable: true })
  userEmail: string;

  @Column({ length: 50, nullable: true })
  userRole: string;

  @Index()
  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Index()
  @Column({ length: 100 })
  module: string; // e.g. "employees", "payroll", "leave"

  @Column({ length: 100, nullable: true })
  resourceId: string;

  @Column({ length: 500, nullable: true })
  summary: string; // human-readable description

  @Column({ length: 10, nullable: true })
  method: string; // HTTP method

  @Column({ length: 500, nullable: true })
  path: string;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 500, nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  before: any;

  @Column({ type: 'jsonb', nullable: true })
  after: any;

  @Column({ type: 'int', nullable: true })
  statusCode: number;
}

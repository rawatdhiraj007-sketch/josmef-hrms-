import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('leave_types')
export class LeaveType extends BaseEntity {
  @Column({ length: 80, unique: true })
  code: string; // VL, SL, ML, PL, etc.

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'int', default: 0 })
  annualEntitlement: number; // days per year

  @Column({ default: true })
  isPaid: boolean;

  @Column({ default: true })
  requiresApproval: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;
}

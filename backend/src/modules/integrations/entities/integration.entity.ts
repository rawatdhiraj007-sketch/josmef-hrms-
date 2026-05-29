import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

/**
 * Channel types JOSMEF can send notifications to.
 * Add new channels in the channels/ folder + update this enum.
 */
export enum ChannelType {
  SLACK = 'slack',
  TEAMS = 'teams',
  WEBHOOK = 'webhook',
  EMAIL = 'email',
  DISCORD = 'discord',
}

/**
 * Event types JOSMEF emits. Adding a new type:
 *   1. Add to this enum
 *   2. Emit it from the responsible service via EventEmitter2
 *   3. Show in the automation rule builder
 */
export enum EventType {
  // Licenses
  LICENSE_EXPIRING_90D = 'license.expiring.90d',
  LICENSE_EXPIRING_30D = 'license.expiring.30d',
  LICENSE_EXPIRING_7D = 'license.expiring.7d',
  LICENSE_EXPIRED = 'license.expired',

  // Employees
  EMPLOYEE_HIRED = 'employee.hired',
  EMPLOYEE_TERMINATED = 'employee.terminated',
  EMPLOYEE_RESIGNED = 'employee.resigned',
  CONTRACT_EXPIRING_30D = 'contract.expiring.30d',
  CONTRACT_EXPIRING_7D = 'contract.expiring.7d',

  // Leave
  LEAVE_REQUESTED = 'leave.requested',
  LEAVE_APPROVED = 'leave.approved',
  LEAVE_REJECTED = 'leave.rejected',

  // Disciplinary / NTE
  NTE_ISSUED = 'nte.issued',
  NTE_OVERDUE = 'nte.overdue',
  DISCIPLINARY_OPENED = 'disciplinary.opened',

  // Shifts
  SHIFT_ASSIGNED = 'shift.assigned',
  SHIFT_NO_SHOW = 'shift.no_show',
  SHIFT_SWAP_REQUESTED = 'shift.swap.requested',

  // Payroll
  PAYROLL_RELEASED = 'payroll.released',
  BONUS_RUN_RELEASED = 'bonus.released',

  // Exit
  EXIT_CLEARANCE_CREATED = 'exit.clearance.created',
  EXIT_CLEARANCE_COMPLETED = 'exit.clearance.completed',
}

@Entity('integrations')
export class Integration extends BaseEntity {
  @Column({ length: 100 })
  name: string; // user-given label, e.g. "HR Slack channel"

  @Index()
  @Column({ type: 'enum', enum: ChannelType })
  channelType: ChannelType;

  /** Webhook/connection URL — Slack incoming webhook, Teams URL, etc. */
  @Column({ type: 'text' })
  webhookUrl: string;

  /** Optional auth token (for channels that need it beyond URL). */
  @Column({ type: 'text', nullable: true })
  authToken: string;

  /** Override default JSON payload format. Free-form for advanced users. */
  @Column({ type: 'jsonb', nullable: true })
  config: any;

  @Column({ default: true })
  isActive: boolean;

  /** Last time we successfully delivered to this channel. */
  @Column({ type: 'timestamp', nullable: true })
  lastDeliveredAt: Date;

  /** Last delivery error message, if any. */
  @Column({ type: 'text', nullable: true })
  lastError: string;

  @Column({ type: 'int', default: 0 })
  deliveryCount: number;

  @Column({ type: 'int', default: 0 })
  errorCount: number;
}

export enum RuleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

@Entity('automation_rules')
export class AutomationRule extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Index()
  @Column({ type: 'enum', enum: EventType })
  trigger: EventType;

  /** Optional JSONata-style filter expression (advanced — left blank for now). */
  @Column({ type: 'text', nullable: true })
  condition: string;

  /** Array of integration IDs to fan out to. */
  @Column({ type: 'simple-array' })
  integrationIds: string[];

  /** Optional message template — `{{employee.firstName}}` style placeholders. */
  @Column({ type: 'text', nullable: true })
  messageTemplate: string;

  @Column({ type: 'enum', enum: RuleStatus, default: RuleStatus.ACTIVE })
  status: RuleStatus;

  @Column({ type: 'int', default: 0 })
  triggerCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTriggeredAt: Date;
}

@Entity('automation_runs')
export class AutomationRun extends BaseEntity {
  @Index()
  @Column()
  ruleId: string;

  @Column({ type: 'enum', enum: EventType })
  event: EventType;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ default: false })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'int', nullable: true })
  responseStatus: number;
}

import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';

/**
 * Professional license / credential tracked per employee.
 * Covers PH (PRC, DOH), UK (NMC, GMC, HCPC), US (state medical boards),
 * EU (country regulators), plus clinical certs (BLS, ACLS, PALS, etc.)
 */
export enum LicenseType {
  // Philippine Professional Regulation Commission
  PRC_RN = 'prc_rn',                // Registered Nurse
  PRC_MD = 'prc_md',                // Physician
  PRC_PT = 'prc_pt',                // Physical Therapist
  PRC_OT = 'prc_ot',                // Occupational Therapist
  PRC_MT = 'prc_mt',                // Medical Technologist
  PRC_RT = 'prc_rt',                // Respiratory Therapist
  PRC_PHARMACIST = 'prc_pharmacist',
  PRC_DENTIST = 'prc_dentist',
  PRC_PSYCHOLOGIST = 'prc_psychologist',
  PRC_RADTECH = 'prc_radtech',
  PRC_NUTRITIONIST = 'prc_nutritionist',
  PRC_MIDWIFE = 'prc_midwife',
  PRC_OTHER = 'prc_other',

  // PH DOH
  DOH_FACILITY = 'doh_facility',
  PHILHEALTH = 'philhealth_accreditation',

  // UK
  NMC = 'nmc',                      // Nursing & Midwifery Council
  GMC = 'gmc',                      // General Medical Council
  HCPC = 'hcpc',                    // Health & Care Professions Council
  GDC = 'gdc',                      // General Dental Council
  GPHC = 'gphc',                    // General Pharmaceutical Council

  // US (generic)
  US_STATE_RN = 'us_state_rn',
  US_STATE_MD = 'us_state_md',
  US_DEA = 'us_dea',                // Drug Enforcement Administration

  // EU generic
  EU_REGULATOR = 'eu_regulator',

  // Clinical certifications (cross-country)
  BLS = 'bls',                      // Basic Life Support
  ACLS = 'acls',                    // Advanced Cardiac Life Support
  PALS = 'pals',                    // Pediatric Advanced Life Support
  NRP = 'nrp',                      // Neonatal Resuscitation
  ATLS = 'atls',                    // Advanced Trauma Life Support
  IV_THERAPY = 'iv_therapy',
  INFECTION_CONTROL = 'infection_control',

  // Background / clearance
  NBI = 'nbi',                      // PH National Bureau of Investigation
  DBS = 'dbs',                      // UK Disclosure & Barring Service

  OTHER = 'other',
}

export enum LicenseStatus {
  ACTIVE = 'active',
  EXPIRING_SOON = 'expiring_soon',   // computed: within 90 days
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
  PENDING_RENEWAL = 'pending_renewal',
}

@Entity('licenses')
export class License extends BaseEntity {
  @Index()
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Index()
  @Column({ type: 'enum', enum: LicenseType })
  licenseType: LicenseType;

  // Free-text label for "Other" or new types not yet enumerated
  @Column({ length: 150, nullable: true })
  customTypeLabel: string;

  @Index()
  @Column({ length: 100 })
  licenseNumber: string;

  @Column({ length: 150, nullable: true })
  issuingAuthority: string; // e.g. "Professional Regulation Commission"

  @Column({ length: 50, nullable: true })
  countryCode: string; // 'PH', 'GB', 'US', 'DE', etc.

  @Column({ type: 'date', nullable: true })
  issueDate: Date;

  @Index()
  @Column({ type: 'date' })
  expiryDate: Date;

  @Index()
  @Column({ type: 'enum', enum: LicenseStatus, default: LicenseStatus.ACTIVE })
  status: LicenseStatus;

  // Continuing Professional Development
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  cpdUnits: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  cpdRequired: number; // e.g. 45 units required for PRC RN renewal

  // External verification (e.g. PRC online verification URL)
  @Column({ type: 'text', nullable: true })
  verificationUrl: string;

  // Stored license document (PDF / image)
  @Column({ type: 'text', nullable: true })
  documentUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Last time we verified with the regulator (if API integration available)
  @Column({ type: 'timestamp', nullable: true })
  lastVerifiedAt: Date;
}

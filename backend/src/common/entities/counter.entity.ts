import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('hrms_counters')
export class Counter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  key: string; // e.g. 'APP-2025', 'TRN-2025', 'EMP-2025', 'FMR-2025'

  @Column({ default: 0 })
  lastValue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

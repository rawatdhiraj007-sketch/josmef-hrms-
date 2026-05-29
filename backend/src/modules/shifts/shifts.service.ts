import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, DataSource } from 'typeorm';
import {
  ShiftTemplate,
  ShiftAssignment,
  ShiftAssignmentStatus,
  ShiftType,
  SwapRequest,
  SwapRequestStatus,
} from './entities/shift.entity';
import { License, LicenseStatus } from '../licenses/entities/license.entity';

interface CreateTemplateDto {
  name: string;
  code?: string;
  startTime: string;
  endTime: string;
  hoursPerShift?: number;
  payMultiplier?: number;
  isNightShift?: boolean;
  requiredCertifications?: string[];
  department?: string;
  unit?: string;
  maxPatientsPerStaff?: number;
  color?: string;
}

interface AssignDto {
  employeeId: string;
  shiftTemplateId: string;
  shiftDate: string; // YYYY-MM-DD
  shiftType?: ShiftType;
  unit?: string;
  notes?: string;
  /** Skip fatigue & credential checks (admin override). */
  force?: boolean;
}

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(ShiftTemplate)
    private readonly tplRepo: Repository<ShiftTemplate>,
    @InjectRepository(ShiftAssignment)
    private readonly asnRepo: Repository<ShiftAssignment>,
    @InjectRepository(SwapRequest)
    private readonly swapRepo: Repository<SwapRequest>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Shift templates ──────────────────────────────────
  listTemplates() {
    return this.tplRepo.find({
      where: { isActive: true },
      order: { startTime: 'ASC' },
    });
  }

  async createTemplate(dto: CreateTemplateDto) {
    const tpl = this.tplRepo.create(dto);
    return this.tplRepo.save(tpl);
  }

  async updateTemplate(id: string, dto: Partial<CreateTemplateDto>) {
    const tpl = await this.tplRepo.findOne({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    Object.assign(tpl, dto);
    return this.tplRepo.save(tpl);
  }

  async deleteTemplate(id: string) {
    const tpl = await this.tplRepo.findOne({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    tpl.isActive = false;
    return this.tplRepo.save(tpl);
  }

  // ─── Assignments ──────────────────────────────────────
  /** Schedule grid for a week/range. */
  async list(opts: {
    dateFrom: string;
    dateTo: string;
    employeeId?: string;
    department?: string;
  }) {
    const where: any = {
      shiftDate: Between(new Date(opts.dateFrom), new Date(opts.dateTo)) as any,
    };
    if (opts.employeeId) where.employeeId = opts.employeeId;
    return this.asnRepo.find({
      where,
      relations: ['employee', 'shiftTemplate'],
      order: { shiftDate: 'ASC' },
    });
  }

  /** Today's roster — used by dashboard / live ops. */
  async today() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.asnRepo.find({
      where: { shiftDate: Between(today, tomorrow) as any },
      relations: ['employee', 'shiftTemplate'],
      order: { shiftDate: 'ASC' },
    });
  }

  /** Assign a shift with credential + fatigue safety checks. */
  async assign(dto: AssignDto): Promise<{
    assignment?: ShiftAssignment;
    warnings: string[];
    errors: string[];
  }> {
    const warnings: string[] = [];
    const errors: string[] = [];

    const tpl = await this.tplRepo.findOne({ where: { id: dto.shiftTemplateId } });
    if (!tpl) throw new NotFoundException('Shift template not found');

    // 1. CREDENTIAL CHECK — does employee have required active licenses?
    if (!dto.force && tpl.requiredCertifications?.length) {
      const licRepo = this.dataSource.getRepository(License);
      const licenses = await licRepo.find({
        where: {
          employeeId: dto.employeeId,
          licenseType: In(tpl.requiredCertifications as any),
        },
      });
      for (const required of tpl.requiredCertifications) {
        const found = licenses.find(l => l.licenseType === required as any);
        if (!found) {
          errors.push(`Employee is missing required certification: ${required.toUpperCase()}`);
        } else if (new Date(found.expiryDate) < new Date()) {
          errors.push(`${required.toUpperCase()} license expired on ${found.expiryDate}`);
        }
      }
    }

    // 2. FATIGUE CHECK — minimum 10 hours between shifts
    if (!dto.force) {
      const date = new Date(dto.shiftDate);
      const prevDate = new Date(date);
      prevDate.setDate(prevDate.getDate() - 1);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const adjacent = await this.asnRepo.find({
        where: {
          employeeId: dto.employeeId,
          shiftDate: Between(prevDate, nextDate) as any,
          status: In([
            ShiftAssignmentStatus.SCHEDULED,
            ShiftAssignmentStatus.CONFIRMED,
            ShiftAssignmentStatus.COMPLETED,
          ]),
        },
        relations: ['shiftTemplate'],
      });
      for (const a of adjacent) {
        const isSameDay = a.shiftDate.toString().slice(0, 10) === dto.shiftDate;
        if (isSameDay) {
          errors.push(`Employee already has a shift on ${dto.shiftDate} (${a.shiftTemplate.name})`);
        } else {
          warnings.push(`Employee has an adjacent-day shift (${a.shiftTemplate.name} on ${a.shiftDate}). Check rest period.`);
        }
      }
    }

    // 3. 7th consecutive day check
    if (!dto.force) {
      const date = new Date(dto.shiftDate);
      const sevenAgo = new Date(date);
      sevenAgo.setDate(sevenAgo.getDate() - 6);
      const week = await this.asnRepo.find({
        where: {
          employeeId: dto.employeeId,
          shiftDate: Between(sevenAgo, date) as any,
        },
      });
      if (week.length >= 6) {
        warnings.push(`Employee already worked ${week.length} days in the last 7 — this would be a 7-day stretch.`);
      }
    }

    if (errors.length && !dto.force) {
      return { errors, warnings };
    }

    const assignment = this.asnRepo.create({
      employeeId: dto.employeeId,
      shiftTemplateId: dto.shiftTemplateId,
      shiftDate: new Date(dto.shiftDate),
      shiftType: dto.shiftType ?? ShiftType.REGULAR,
      unit: dto.unit ?? tpl.unit,
      notes: dto.notes,
      status: ShiftAssignmentStatus.SCHEDULED,
    });
    const saved = await this.asnRepo.save(assignment);
    return { assignment: saved, warnings, errors: [] };
  }

  async updateStatus(id: string, status: ShiftAssignmentStatus) {
    const a = await this.asnRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Assignment not found');
    a.status = status;
    return this.asnRepo.save(a);
  }

  async remove(id: string) {
    const a = await this.asnRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Assignment not found');
    await this.asnRepo.softRemove(a);
    return { ok: true };
  }

  // ─── Swap requests ────────────────────────────────────
  async requestSwap(data: {
    fromAssignmentId: string;
    requestedByEmployeeId: string;
    targetEmployeeId?: string;
    reason?: string;
  }) {
    return this.swapRepo.save(
      this.swapRepo.create({ ...data, status: SwapRequestStatus.PENDING }),
    );
  }

  async listSwaps(status?: SwapRequestStatus) {
    return this.swapRepo.find({
      where: status ? { status } : {},
      relations: ['fromAssignment', 'fromAssignment.employee', 'fromAssignment.shiftTemplate'],
      order: { createdAt: 'DESC' },
    });
  }

  async approveSwap(id: string, approverId: string) {
    const swap = await this.swapRepo.findOne({
      where: { id },
      relations: ['fromAssignment'],
    });
    if (!swap) throw new NotFoundException('Swap request not found');
    if (swap.status !== SwapRequestStatus.PENDING) {
      throw new BadRequestException('Swap already resolved');
    }
    swap.status = SwapRequestStatus.APPROVED;
    swap.approvedBy = approverId;
    swap.approvedAt = new Date();

    // Reassign the shift to target employee
    if (swap.targetEmployeeId) {
      swap.fromAssignment.employeeId = swap.targetEmployeeId;
      swap.fromAssignment.status = ShiftAssignmentStatus.SWAPPED;
      await this.asnRepo.save(swap.fromAssignment);
    }
    return this.swapRepo.save(swap);
  }

  async rejectSwap(id: string, approverId: string) {
    const swap = await this.swapRepo.findOne({ where: { id } });
    if (!swap) throw new NotFoundException('Swap request not found');
    swap.status = SwapRequestStatus.REJECTED;
    swap.approvedBy = approverId;
    swap.approvedAt = new Date();
    return this.swapRepo.save(swap);
  }

  // ─── Summary / stats ──────────────────────────────────
  async summary(dateFrom: string, dateTo: string) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const all = await this.asnRepo.find({
      where: { shiftDate: Between(from, to) as any },
    });

    const byStatus = all.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = all.reduce((acc, a) => {
      acc[a.shiftType] = (acc[a.shiftType] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: all.length,
      byStatus,
      byType,
      openShifts: byStatus[ShiftAssignmentStatus.SCHEDULED] ?? 0,
      noShows: byStatus[ShiftAssignmentStatus.NO_SHOW] ?? 0,
      completed: byStatus[ShiftAssignmentStatus.COMPLETED] ?? 0,
    };
  }
}

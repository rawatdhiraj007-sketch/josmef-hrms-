import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LeaveType } from './entities/leave-type.entity';
import { LeaveRequest, LeaveStatus } from './entities/leave-request.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import {
  CreateLeaveTypeDto,
  UpdateLeaveTypeDto,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  SetBalanceDto,
} from './dto/leave.dto';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveType)
    private readonly typeRepo: Repository<LeaveType>,
    @InjectRepository(LeaveRequest)
    private readonly reqRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveBalance)
    private readonly balRepo: Repository<LeaveBalance>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Leave Types ──────────────────────────────────────
  listTypes() {
    return this.typeRepo.find({ order: { code: 'ASC' } });
  }

  createType(dto: CreateLeaveTypeDto) {
    return this.typeRepo.save(this.typeRepo.create(dto));
  }

  async updateType(id: string, dto: UpdateLeaveTypeDto) {
    const t = await this.typeRepo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Leave type not found');
    Object.assign(t, dto);
    return this.typeRepo.save(t);
  }

  // ─── Requests ─────────────────────────────────────────
  private computeDays(start: Date, end: Date): number {
    const s = new Date(start);
    const e = new Date(end);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    if (e < s) throw new BadRequestException('End date must be after start date');
    return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
  }

  async createRequest(dto: CreateLeaveRequestDto, requestedBy?: string) {
    const totalDays = this.computeDays(new Date(dto.startDate), new Date(dto.endDate));
    const year = new Date(dto.startDate).getFullYear();

    // Check balance
    const balance = await this.getOrCreateBalance(dto.employeeId, dto.leaveTypeId, year);
    const available = Number(balance.entitled) - Number(balance.used) - Number(balance.pending);
    if (totalDays > available) {
      throw new BadRequestException(
        `Insufficient balance. Requested ${totalDays} days, available ${available}.`,
      );
    }

    const req = this.reqRepo.create({
      ...dto,
      totalDays,
      requestNumber: `LR-${Date.now().toString().slice(-9)}`,
      status: LeaveStatus.PENDING,
    });
    const saved = await this.reqRepo.save(req);

    // Reserve pending days
    balance.pending = Number(balance.pending) + totalDays;
    await this.balRepo.save(balance);

    return saved;
  }

  async listRequests(opts: {
    employeeId?: string;
    status?: LeaveStatus;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, opts.limit ?? 50);
    const where: any = {};
    if (opts.employeeId) where.employeeId = opts.employeeId;
    if (opts.status) where.status = opts.status;
    const [rows, total] = await this.reqRepo.findAndCount({
      where,
      relations: ['employee', 'leaveType'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { rows, total, page, limit };
  }

  async findRequest(id: string) {
    const r = await this.reqRepo.findOne({
      where: { id },
      relations: ['employee', 'leaveType'],
    });
    if (!r) throw new NotFoundException('Leave request not found');
    return r;
  }

  async updateRequest(id: string, dto: UpdateLeaveRequestDto, approverId?: string) {
    const r = await this.findRequest(id);
    const previousStatus = r.status;

    if (dto.status && dto.status !== previousStatus) {
      const year = new Date(r.startDate).getFullYear();
      const balance = await this.getOrCreateBalance(r.employeeId, r.leaveTypeId, year);
      const days = Number(r.totalDays);

      // Transition: PENDING → APPROVED   : pending - days, used + days
      // PENDING → REJECTED/CANCELLED     : pending - days
      // APPROVED → CANCELLED             : used - days
      if (previousStatus === LeaveStatus.PENDING && dto.status === LeaveStatus.APPROVED) {
        balance.pending = Math.max(0, Number(balance.pending) - days);
        balance.used = Number(balance.used) + days;
      } else if (
        previousStatus === LeaveStatus.PENDING &&
        (dto.status === LeaveStatus.REJECTED || dto.status === LeaveStatus.CANCELLED)
      ) {
        balance.pending = Math.max(0, Number(balance.pending) - days);
      } else if (
        previousStatus === LeaveStatus.APPROVED &&
        dto.status === LeaveStatus.CANCELLED
      ) {
        balance.used = Math.max(0, Number(balance.used) - days);
      }
      await this.balRepo.save(balance);

      r.status = dto.status;
      if (dto.status === LeaveStatus.APPROVED || dto.status === LeaveStatus.REJECTED) {
        r.approvedBy = approverId ?? r.approvedBy;
        r.approvedAt = new Date();
      }
    }
    if (dto.approverRemarks !== undefined) r.approverRemarks = dto.approverRemarks;

    return this.reqRepo.save(r);
  }

  // ─── Balances ─────────────────────────────────────────
  async getOrCreateBalance(employeeId: string, leaveTypeId: string, year: number) {
    let b = await this.balRepo.findOne({ where: { employeeId, leaveTypeId, year } });
    if (!b) {
      const type = await this.typeRepo.findOne({ where: { id: leaveTypeId } });
      if (!type) throw new NotFoundException('Leave type not found');
      b = this.balRepo.create({
        employeeId,
        leaveTypeId,
        year,
        entitled: type.annualEntitlement,
        used: 0,
        pending: 0,
      });
      b = await this.balRepo.save(b);
    }
    return b;
  }

  async getEmployeeBalances(employeeId: string, year?: number) {
    const y = year ?? new Date().getFullYear();
    const types = await this.typeRepo.find({ where: { isActive: true } });

    const results: Array<{
      leaveType: LeaveType;
      year: number;
      entitled: number;
      used: number;
      pending: number;
      remaining: number;
    }> = [];
    for (const t of types) {
      const b = await this.getOrCreateBalance(employeeId, t.id, y);
      results.push({
        leaveType: t,
        year: y,
        entitled: Number(b.entitled),
        used: Number(b.used),
        pending: Number(b.pending),
        remaining: Number(b.entitled) - Number(b.used) - Number(b.pending),
      });
    }
    return results;
  }

  async setBalance(dto: SetBalanceDto) {
    let b = await this.balRepo.findOne({
      where: { employeeId: dto.employeeId, leaveTypeId: dto.leaveTypeId, year: dto.year },
    });
    if (!b) {
      b = this.balRepo.create({ ...dto, used: 0, pending: 0 });
    } else {
      b.entitled = dto.entitled;
    }
    return this.balRepo.save(b);
  }

  // ─── Summary ──────────────────────────────────────────
  async summary() {
    const total = await this.reqRepo.count();
    const pending = await this.reqRepo.count({ where: { status: LeaveStatus.PENDING } });
    const approved = await this.reqRepo.count({ where: { status: LeaveStatus.APPROVED } });
    const rejected = await this.reqRepo.count({ where: { status: LeaveStatus.REJECTED } });
    return { total, pending, approved, rejected };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExitClearance, ClearanceItem, ClearanceStatus } from './entities/exit-clearance.entity';
import {
  CreateExitClearanceDto, UpdateExitClearanceDto,
  ClearItemDto, QueryExitClearanceDto,
} from './dto/exit-clearance.dto';
import { NotificationService } from '@common/services/notification.service';
import { Employee } from '../employees/entities/employee.entity';

const DEFAULT_CLEARANCE_ITEMS = [
  { department: 'HR', requirement: 'Return company ID and access cards' },
  { department: 'HR', requirement: 'Submit signed resignation/termination letter' },
  { department: 'HR', requirement: 'Exit interview completed' },
  { department: 'IT', requirement: 'Return laptop/equipment' },
  { department: 'IT', requirement: 'Email and system access revoked' },
  { department: 'Finance', requirement: 'No pending cash advances or loans' },
  { department: 'Finance', requirement: 'Final pay computation approved' },
  { department: 'Admin', requirement: 'Return company uniform/supplies' },
  { department: 'Admin', requirement: 'Locker/workspace cleared' },
  { department: 'Operations', requirement: 'Turnover of duties completed' },
  { department: 'Operations', requirement: 'All pending tasks handed over' },
];

@Injectable()
export class ExitClearanceService {
  constructor(
    @InjectRepository(ExitClearance) private readonly repo: Repository<ExitClearance>,
    @InjectRepository(ClearanceItem) private readonly itemRepo: Repository<ClearanceItem>,
    @InjectRepository(Employee) private readonly empRepo: Repository<Employee>,
    private readonly notification: NotificationService,
  ) {}

  async create(dto: CreateExitClearanceDto, userId: string): Promise<ExitClearance> {
    const clearance = this.repo.create({
      employeeId: dto.employeeId,
      separationType: dto.separationType,
      lastWorkingDay: dto.lastWorkingDay,
      resignationDate: dto.resignationDate,
      effectiveDate: dto.effectiveDate,
      reason: dto.reason,
      remarks: dto.remarks,
      status: ClearanceStatus.PENDING,
      createdBy: userId,
    });
    const saved = await this.repo.save(clearance);

    // Create clearance items (custom or default)
    const itemDefs = dto.items && dto.items.length > 0 ? dto.items : DEFAULT_CLEARANCE_ITEMS;
    const items = itemDefs.map((item) =>
      this.itemRepo.create({
        clearanceId: saved.id,
        department: item.department,
        requirement: item.requirement,
        remarks: (item as any).remarks || null,
      }),
    );
    await this.itemRepo.save(items);

    // Send notification to employee (non-blocking)
    const emp = await this.empRepo.findOne({
      where: { id: dto.employeeId },
      select: ['email', 'firstName', 'lastName'],
    });
    if (emp?.email) {
      this.notification.sendExitClearanceCreated({
        employeeEmail: emp.email,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        lastWorkingDay: dto.lastWorkingDay?.toString() || '',
        separationType: dto.separationType,
      }).catch(() => {});
    }

    return this.findOne(saved.id);
  }

  async findAll(query: QueryExitClearanceDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('ec')
      .leftJoinAndSelect('ec.employee', 'e')
      .leftJoinAndSelect('ec.items', 'ci')
      .where('ec.deleted_at IS NULL');

    if (query.status) qb.andWhere('ec.status = :st', { st: query.status });
    if (query.search) {
      qb.andWhere('(e.firstName ILIKE :s OR e.lastName ILIKE :s OR e.employeeId ILIKE :s)', { s: `%${query.search}%` });
    }

    qb.orderBy('ec.created_at', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<ExitClearance> {
    const rec = await this.repo.findOne({
      where: { id },
      relations: ['employee', 'items'],
    });
    if (!rec) throw new NotFoundException('Exit clearance not found');
    return rec;
  }

  async update(id: string, dto: UpdateExitClearanceDto, userId: string): Promise<ExitClearance> {
    const rec = await this.findOne(id);
    Object.assign(rec, dto, { updatedBy: userId });
    return this.repo.save(rec);
  }

  async clearItem(dto: ClearItemDto, userId: string): Promise<ClearanceItem> {
    const item = await this.itemRepo.findOne({ where: { id: dto.clearanceItemId } });
    if (!item) throw new NotFoundException('Clearance item not found');

    item.isCleared = true;
    item.clearedBy = userId;
    item.clearedAt = new Date();
    item.remarks = dto.remarks || item.remarks;
    const saved = await this.itemRepo.save(item);

    // Check if all items cleared — auto-complete
    const allItems = await this.itemRepo.find({ where: { clearanceId: item.clearanceId } });
    const allCleared = allItems.every((i) => i.isCleared);
    if (allCleared) {
      await this.repo.update(item.clearanceId, {
        status: ClearanceStatus.COMPLETED,
        completedDate: new Date(),
        updatedBy: userId,
      });
    } else {
      await this.repo.update(item.clearanceId, {
        status: ClearanceStatus.IN_PROGRESS,
        updatedBy: userId,
      });
    }

    return saved;
  }

  async sign(
    id: string,
    signerType: 'employee' | 'hr',
    signatureData: string,
    signerName?: string,
  ): Promise<ExitClearance> {
    const rec = await this.findOne(id);
    const now = new Date();
    if (signerType === 'employee') {
      rec.employeeSignature = signatureData;
      rec.employeeSignedAt = now;
    } else {
      rec.hrSignature = signatureData;
      rec.hrSignedAt = now;
      rec.hrSignedBy = signerName || 'HR Officer';
    }
    return this.repo.save(rec);
  }

  async clearSignature(id: string, signerType: 'employee' | 'hr'): Promise<ExitClearance> {
    const rec = await this.findOne(id);
    if (signerType === 'employee') {
      rec.employeeSignature = null;
      rec.employeeSignedAt = null;
    } else {
      rec.hrSignature = null;
      rec.hrSignedAt = null;
      rec.hrSignedBy = null;
    }
    return this.repo.save(rec);
  }

  async remove(id: string): Promise<void> {
    const rec = await this.findOne(id);
    await this.repo.softRemove(rec);
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BonusRun, BonusItem, BonusType, BonusRunStatus } from './bonus-run.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Payroll } from '../entities/payroll.entity';
import { EmploymentStatus } from '@common/enums';

export interface CreateBonusRunDto {
  title: string;
  type: BonusType;
  year: number;
  payoutDate: string;
  notes?: string;
  employeeIds?: string[]; // optional — defaults to all active
  amountPerEmployee?: number; // for fixed-amount bonus runs
}

export interface UpdateBonusItemDto {
  amount?: number;
  remarks?: string;
}

@Injectable()
export class BonusService {
  constructor(
    @InjectRepository(BonusRun)
    private readonly runRepo: Repository<BonusRun>,
    @InjectRepository(BonusItem)
    private readonly itemRepo: Repository<BonusItem>,
    private readonly dataSource: DataSource,
  ) {}

  async list() {
    return this.runRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const r = await this.runRepo.findOne({
      where: { id },
      relations: ['items', 'items.employee'],
    });
    if (!r) throw new NotFoundException('Bonus run not found');
    return r;
  }

  async create(dto: CreateBonusRunDto) {
    const empRepo = this.dataSource.getRepository(Employee);
    const payRepo = this.dataSource.getRepository(Payroll);

    // Get target employees
    let employees: Employee[];
    if (dto.employeeIds?.length) {
      employees = await empRepo.findByIds(dto.employeeIds);
    } else {
      employees = await empRepo.find({
        where: [
          { employmentStatus: EmploymentStatus.REGULAR },
          { employmentStatus: EmploymentStatus.PROBATIONARY },
        ],
      });
    }
    if (!employees.length) throw new BadRequestException('No eligible employees');

    // Compute items
    const items: BonusItem[] = [];
    let total = 0;
    for (const emp of employees) {
      let amount = dto.amountPerEmployee ?? 0;
      let basis = 0;

      if (dto.type === BonusType.THIRTEENTH_MONTH) {
        // Philippine 13th-month: total basic pay during the year ÷ 12
        const payrolls = await payRepo
          .createQueryBuilder('p')
          .select('SUM(p."basicPay")', 'sum')
          .where('p."employeeId" = :id', { id: emp.id })
          .andWhere(`EXTRACT(YEAR FROM p."payDateTo") = :year`, { year: dto.year })
          .getRawOne();
        basis = Number(payrolls?.sum ?? 0);
        amount = Math.round((basis / 12) * 100) / 100;
      }

      const item = this.itemRepo.create({
        employeeId: emp.id,
        basis,
        amount,
        remarks: dto.type === BonusType.THIRTEENTH_MONTH
          ? `${dto.year} basic pay total: ₱${basis.toLocaleString()}`
          : undefined,
      });
      items.push(item);
      total += amount;
    }

    const run = this.runRepo.create({
      runNumber: `BR-${Date.now().toString().slice(-9)}`,
      title: dto.title,
      type: dto.type,
      year: dto.year,
      payoutDate: new Date(dto.payoutDate),
      notes: dto.notes,
      status: BonusRunStatus.DRAFT,
      totalAmount: total,
      totalEmployees: items.length,
      items,
    });

    return this.runRepo.save(run);
  }

  async updateItem(itemId: string, dto: UpdateBonusItemDto) {
    const item = await this.itemRepo.findOne({ where: { id: itemId }, relations: ['run'] });
    if (!item) throw new NotFoundException('Item not found');
    if (item.run.status !== BonusRunStatus.DRAFT) {
      throw new BadRequestException('Cannot edit items in a non-draft run');
    }
    if (dto.amount !== undefined) item.amount = dto.amount;
    if (dto.remarks !== undefined) item.remarks = dto.remarks;
    await this.itemRepo.save(item);
    // Recompute total
    const run = await this.runRepo.findOne({ where: { id: item.runId }, relations: ['items'] });
    if (run) {
      run.totalAmount = run.items.reduce((s, i) => s + Number(i.amount), 0);
      await this.runRepo.save(run);
    }
    return item;
  }

  async setStatus(id: string, status: BonusRunStatus) {
    const run = await this.findOne(id);
    run.status = status;
    return this.runRepo.save(run);
  }

  async remove(id: string) {
    const run = await this.findOne(id);
    if (run.status === BonusRunStatus.RELEASED) {
      throw new BadRequestException('Cannot delete a released run');
    }
    await this.runRepo.remove(run);
    return { ok: true };
  }
}

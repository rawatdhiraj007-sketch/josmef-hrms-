import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormerEmployee } from './entities/former-employee.entity';
import { QueryFormerEmployeeDto, UpdateFormerEmployeeDto } from './dto/former-employee.dto';
import { NumberingService } from '@common/services/numbering.service';

@Injectable()
export class FormerEmployeesService {
  constructor(
    @InjectRepository(FormerEmployee)
    private readonly repo: Repository<FormerEmployee>,
    private readonly numbering: NumberingService,
  ) {}

  async findAll(query: QueryFormerEmployeeDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('fe').where('fe.deleted_at IS NULL');

    if (query.search) {
      qb.andWhere(
        `(fe.firstName ILIKE :s OR fe.lastName ILIKE :s OR fe.email ILIKE :s
         OR fe.employeeId ILIKE :s OR fe.formerEmployeeNumber ILIKE :s)`,
        { s: `%${query.search}%` },
      );
    }
    if (query.department) qb.andWhere('fe.department = :dept', { dept: query.department });
    if (query.separationReason) qb.andWhere('fe.separationReason = :sr', { sr: query.separationReason });

    qb.orderBy('fe.dateSeparated', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<FormerEmployee> {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException('Former employee record not found');
    return rec;
  }

  async update(id: string, dto: UpdateFormerEmployeeDto, userId: string): Promise<FormerEmployee> {
    const rec = await this.findOne(id);
    Object.assign(rec, dto, { updatedBy: userId });
    return this.repo.save(rec);
  }

  async countByReason() {
    return this.repo.createQueryBuilder('fe')
      .select('fe.separationReason', 'reason')
      .addSelect('COUNT(*)', 'count')
      .where('fe.deleted_at IS NULL')
      .groupBy('fe.separationReason')
      .getRawMany();
  }

  /**
   * Called by EmployeesService.archive() — creates the FMR record.
   */
  async createFromEmployee(data: Partial<FormerEmployee>, userId: string): Promise<FormerEmployee> {
    const formerEmployeeNumber = await this.numbering.next('FMR');
    const rec = this.repo.create({ ...data, formerEmployeeNumber, createdBy: userId });
    return this.repo.save(rec);
  }
}

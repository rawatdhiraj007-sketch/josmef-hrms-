import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NteRecord } from './entities/nte.entity';
import { CreateNteDto, UpdateNteDto, QueryNteDto } from './dto/nte.dto';
import { NumberingService } from '@common/services/numbering.service';

@Injectable()
export class NteService {
  constructor(
    @InjectRepository(NteRecord)
    private readonly repo: Repository<NteRecord>,
    private readonly numbering: NumberingService,
  ) {}

  async create(dto: CreateNteDto, userId: string): Promise<NteRecord> {
    const nteNumber = await this.numbering.next('NTE');
    const record = this.repo.create({ ...dto, nteNumber, createdBy: userId });
    return this.repo.save(record);
  }

  async findAll(query: QueryNteDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('n')
      .leftJoinAndSelect('n.employee', 'e')
      .where('n.deleted_at IS NULL');

    if (query.employeeId) qb.andWhere('n.employeeId = :eid', { eid: query.employeeId });
    if (query.status) qb.andWhere('n.status = :st', { st: query.status });
    if (query.search) {
      qb.andWhere(
        '(e.firstName ILIKE :s OR e.lastName ILIKE :s OR n.subject ILIKE :s OR n.nteNumber ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.orderBy('n.dateIssued', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<NteRecord> {
    const record = await this.repo.findOne({ where: { id }, relations: ['employee'] });
    if (!record) throw new NotFoundException('NTE record not found');
    return record;
  }

  async update(id: string, dto: UpdateNteDto, userId: string): Promise<NteRecord> {
    const record = await this.findOne(id);
    Object.assign(record, dto, { updatedBy: userId });
    return this.repo.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.repo.softRemove(record);
  }
}

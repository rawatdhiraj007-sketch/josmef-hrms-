import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisciplinaryAction } from './entities/disciplinary.entity';
import { CreateDisciplinaryDto, UpdateDisciplinaryDto, QueryDisciplinaryDto } from './dto/disciplinary.dto';

@Injectable()
export class DisciplinaryService {
  constructor(
    @InjectRepository(DisciplinaryAction)
    private readonly repo: Repository<DisciplinaryAction>,
  ) {}

  async create(dto: CreateDisciplinaryDto, userId: string): Promise<DisciplinaryAction> {
    const record = this.repo.create({ ...dto, createdBy: userId });
    return this.repo.save(record);
  }

  async findAll(query: QueryDisciplinaryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('d')
      .leftJoinAndSelect('d.employee', 'e')
      .where('d.deleted_at IS NULL');

    if (query.employeeId) qb.andWhere('d.employeeId = :eid', { eid: query.employeeId });
    if (query.type) qb.andWhere('d.type = :type', { type: query.type });
    if (query.status) qb.andWhere('d.status = :st', { st: query.status });
    if (query.search) {
      qb.andWhere(
        '(e.firstName ILIKE :s OR e.lastName ILIKE :s OR d.offense ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.orderBy('d.incidentDate', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<DisciplinaryAction> {
    const record = await this.repo.findOne({ where: { id }, relations: ['employee'] });
    if (!record) throw new NotFoundException('Disciplinary record not found');
    return record;
  }

  async update(id: string, dto: UpdateDisciplinaryDto, userId: string): Promise<DisciplinaryAction> {
    const record = await this.findOne(id);
    Object.assign(record, dto, { updatedBy: userId });
    return this.repo.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.repo.softRemove(record);
  }
}

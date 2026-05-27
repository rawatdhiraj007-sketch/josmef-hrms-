import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidentReport } from './entities/incident-report.entity';
import {
  CreateIncidentReportDto,
  UpdateIncidentReportDto,
  QueryIncidentReportDto,
} from './dto/incident-report.dto';
import { NumberingService } from '@common/services/numbering.service';

@Injectable()
export class IncidentReportsService {
  constructor(
    @InjectRepository(IncidentReport)
    private readonly repo: Repository<IncidentReport>,
    private readonly numbering: NumberingService,
  ) {}

  async create(dto: CreateIncidentReportDto, userId: string): Promise<IncidentReport> {
    const reportNumber = await this.numbering.next('INC');
    const record = this.repo.create({ ...dto, reportNumber, createdBy: userId });
    return this.repo.save(record);
  }

  async findAll(query: QueryIncidentReportDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('ir')
      .leftJoinAndSelect('ir.involvedEmployee', 'ie')
      .leftJoinAndSelect('ir.reportedBy', 're')
      .where('ir.deleted_at IS NULL');

    if (query.involvedEmployeeId) qb.andWhere('ir.involvedEmployeeId = :eid', { eid: query.involvedEmployeeId });
    if (query.severity) qb.andWhere('ir.severity = :sv', { sv: query.severity });
    if (query.status) qb.andWhere('ir.status = :st', { st: query.status });
    if (query.search) {
      qb.andWhere(
        '(ir.title ILIKE :s OR ir.description ILIKE :s OR ir.reportNumber ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.orderBy('ir.incidentDate', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<IncidentReport> {
    const record = await this.repo.findOne({
      where: { id },
      relations: ['involvedEmployee', 'reportedBy'],
    });
    if (!record) throw new NotFoundException('Incident report not found');
    return record;
  }

  async update(id: string, dto: UpdateIncidentReportDto, userId: string): Promise<IncidentReport> {
    const record = await this.findOne(id);
    Object.assign(record, dto, { updatedBy: userId });
    return this.repo.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.repo.softRemove(record);
  }
}

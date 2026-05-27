import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkCertificate } from './entities/work-certificate.entity';
import {
  CreateWorkCertificateDto,
  UpdateWorkCertificateDto,
  QueryWorkCertificateDto,
} from './dto/work-certificate.dto';
import { NumberingService } from '@common/services/numbering.service';

@Injectable()
export class WorkCertificatesService {
  constructor(
    @InjectRepository(WorkCertificate)
    private readonly repo: Repository<WorkCertificate>,
    private readonly numbering: NumberingService,
  ) {}

  async create(dto: CreateWorkCertificateDto, userId: string): Promise<WorkCertificate> {
    const certificateNumber = await this.numbering.next('CERT');
    const record = this.repo.create({ ...dto, certificateNumber, createdBy: userId });
    return this.repo.save(record);
  }

  async findAll(query: QueryWorkCertificateDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('c')
      .leftJoinAndSelect('c.employee', 'e')
      .where('c.deleted_at IS NULL');

    if (query.employeeId) qb.andWhere('c.employeeId = :eid', { eid: query.employeeId });
    if (query.certificateType) qb.andWhere('c.certificateType = :ct', { ct: query.certificateType });
    if (query.status) qb.andWhere('c.status = :st', { st: query.status });
    if (query.search) {
      qb.andWhere(
        '(e.firstName ILIKE :s OR e.lastName ILIKE :s OR c.certificateNumber ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.orderBy('c.requestDate', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<WorkCertificate> {
    const record = await this.repo.findOne({ where: { id }, relations: ['employee'] });
    if (!record) throw new NotFoundException('Work certificate not found');
    return record;
  }

  async update(id: string, dto: UpdateWorkCertificateDto, userId: string): Promise<WorkCertificate> {
    const record = await this.findOne(id);
    Object.assign(record, dto, { updatedBy: userId });
    return this.repo.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.repo.softRemove(record);
  }
}

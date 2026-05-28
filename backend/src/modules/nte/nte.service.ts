import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NteRecord } from './entities/nte.entity';
import { CreateNteDto, UpdateNteDto, QueryNteDto } from './dto/nte.dto';
import { NumberingService } from '@common/services/numbering.service';
import { NotificationService } from '@common/services/notification.service';
import { Employee } from '../employees/entities/employee.entity';

@Injectable()
export class NteService {
  constructor(
    @InjectRepository(NteRecord)
    private readonly repo: Repository<NteRecord>,
    @InjectRepository(Employee)
    private readonly empRepo: Repository<Employee>,
    private readonly numbering: NumberingService,
    private readonly notification: NotificationService,
  ) {}

  async create(dto: CreateNteDto, userId: string): Promise<NteRecord> {
    const nteNumber = await this.numbering.next('NTE');
    const record = this.repo.create({ ...dto, nteNumber, createdBy: userId });
    const saved = await this.repo.save(record);

    // Send email notification (non-blocking)
    if (dto.employeeId) {
      const emp = await this.empRepo.findOne({
        where: { id: dto.employeeId },
        select: ['email', 'firstName', 'lastName'],
      });
      if (emp?.email) {
        this.notification.sendNteIssued({
          employeeEmail: emp.email,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          nteNumber,
          subject: dto.subject,
          deadline: dto.deadlineToReply?.toString() || 'N/A',
          issuedBy: dto.issuedBy || 'HR Department',
        }).catch(() => {}); // fire-and-forget
      }
    }

    return saved;
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

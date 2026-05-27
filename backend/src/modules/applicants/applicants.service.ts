import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Applicant } from './entities/applicant.entity';
import { CreateApplicantDto, UpdateApplicantDto, QueryApplicantDto } from './dto/applicant.dto';
import { NumberingService } from '@common/services/numbering.service';
import { ApplicantStatus } from '@common/enums';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectRepository(Applicant)
    private readonly repo: Repository<Applicant>,
    private readonly numbering: NumberingService,
  ) {}

  async create(dto: CreateApplicantDto, userId: string): Promise<Applicant> {
    const applicantNumber = await this.numbering.next('APP');
    const applicant = this.repo.create({
      ...dto,
      applicantNumber,
      middleName: dto.middleName || '',
      applicationDate: dto.applicationDate || new Date().toISOString().split('T')[0],
      createdBy: userId,
    });
    return this.repo.save(applicant);
  }

  /**
   * Public submission (no auth) — used by the self-service applicant portal
   */
  async publicSubmit(dto: CreateApplicantDto): Promise<Applicant> {
    const applicantNumber = await this.numbering.next('APP');
    const applicant = this.repo.create({
      ...dto,
      applicantNumber,
      middleName: dto.middleName || '',
      status: ApplicantStatus.NEW,
      sourceChannel: dto.sourceChannel || 'Online Portal',
      applicationDate: new Date().toISOString().split('T')[0],
    });
    return this.repo.save(applicant);
  }

  async findAll(query: QueryApplicantDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('a')
      .where('a.deleted_at IS NULL');

    if (query.search) {
      qb.andWhere(
        `(a.firstName ILIKE :s OR a.lastName ILIKE :s OR a.email ILIKE :s
         OR a.mobile ILIKE :s OR a.positionApplied ILIKE :s OR a.applicantNumber ILIKE :s)`,
        { s: `%${query.search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('a.status = :status', { status: query.status });
    }

    if (query.department) {
      qb.andWhere('a.department = :dept', { dept: query.department });
    }

    qb.orderBy('a.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Applicant> {
    const applicant = await this.repo.findOne({ where: { id } });
    if (!applicant) throw new NotFoundException('Applicant not found');
    return applicant;
  }

  async update(id: string, dto: UpdateApplicantDto, userId: string): Promise<Applicant> {
    const applicant = await this.findOne(id);
    Object.assign(applicant, dto, { updatedBy: userId });
    return this.repo.save(applicant);
  }

  async remove(id: string): Promise<void> {
    const applicant = await this.findOne(id);
    await this.repo.softRemove(applicant);
  }

  async countByStatus() {
    const result = await this.repo
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('a.deleted_at IS NULL')
      .groupBy('a.status')
      .getRawMany();
    return result;
  }
}

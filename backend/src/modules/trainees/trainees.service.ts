import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainee } from './entities/trainee.entity';
import { CreateTraineeDto, UpdateTraineeDto, QueryTraineeDto } from './dto/trainee.dto';
import { ApplicantsService } from '../applicants/applicants.service';
import { ApplicantStatus } from '@common/enums';
import { NumberingService } from '@common/services/numbering.service';

@Injectable()
export class TraineesService {
  constructor(
    @InjectRepository(Trainee)
    private readonly repo: Repository<Trainee>,
    private readonly applicantsService: ApplicantsService,
    private readonly numbering: NumberingService,
  ) {}

  async create(dto: CreateTraineeDto, userId: string): Promise<Trainee> {
    const traineeNumber = await this.numbering.next('TRN');
    const trainee = this.repo.create({
      ...dto,
      traineeNumber,
      middleName: dto.middleName || '',
      createdBy: userId,
    });
    const saved = await this.repo.save(trainee);

    // Update applicant status if linked
    if (dto.applicantId) {
      await this.applicantsService.update(dto.applicantId, { status: ApplicantStatus.APPROVED }, userId);
    }

    return saved;
  }

  async createFromApplicant(applicantId: string, dto: Partial<CreateTraineeDto>, userId: string): Promise<Trainee> {
    const applicant = await this.applicantsService.findOne(applicantId);
    const traineeNumber = await this.numbering.next('TRN');
    const trainee = this.repo.create({
      applicantId,
      traineeNumber,
      firstName: applicant.firstName,
      middleName: applicant.middleName,
      lastName: applicant.lastName,
      email: applicant.email,
      mobile: applicant.mobile,
      positionApplied: applicant.positionApplied,
      department: applicant.department,
      trainingStartDate: dto.trainingStartDate || new Date().toISOString().split('T')[0],
      ...dto,
      createdBy: userId,
    });
    const saved = await this.repo.save(trainee);
    await this.applicantsService.update(applicantId, { status: ApplicantStatus.APPROVED }, userId);
    return saved;
  }

  async findAll(query: QueryTraineeDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('t').where('t.deleted_at IS NULL');

    if (query.search) {
      qb.andWhere(
        `(t.firstName ILIKE :s OR t.lastName ILIKE :s OR t.email ILIKE :s
         OR t.positionApplied ILIKE :s OR t.traineeNumber ILIKE :s)`,
        { s: `%${query.search}%` },
      );
    }
    if (query.status) qb.andWhere('t.status = :status', { status: query.status });
    if (query.department) qb.andWhere('t.department = :dept', { dept: query.department });

    qb.orderBy('t.created_at', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<Trainee> {
    const trainee = await this.repo.findOne({ where: { id } });
    if (!trainee) throw new NotFoundException('Trainee not found');
    return trainee;
  }

  async update(id: string, dto: UpdateTraineeDto, userId: string): Promise<Trainee> {
    const trainee = await this.findOne(id);
    Object.assign(trainee, dto, { updatedBy: userId });
    return this.repo.save(trainee);
  }

  async remove(id: string): Promise<void> {
    const trainee = await this.findOne(id);
    await this.repo.softRemove(trainee);
  }

  async countByStatus() {
    return this.repo.createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('t.deleted_at IS NULL')
      .groupBy('t.status')
      .getRawMany();
  }
}

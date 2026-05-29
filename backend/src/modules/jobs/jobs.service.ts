import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOpening, EmploymentType } from './job-opening.entity';

export interface CreateJobDto {
  title: string;
  department?: string;
  location?: string;
  employmentType?: EmploymentType;
  description?: string;
  responsibilities?: string[];
  qualifications?: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  postedDate?: string;
  closingDate?: string;
  isActive?: boolean;
  numberOfOpenings?: number;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobOpening)
    private readonly repo: Repository<JobOpening>,
  ) {}

  listAll() {
    return this.repo.find({ order: { isActive: 'DESC', createdAt: 'DESC' } });
  }

  /** Public — only return ACTIVE openings, lean fields */
  async listActive() {
    return this.repo.find({
      where: { isActive: true },
      order: { postedDate: 'DESC', createdAt: 'DESC' },
      select: [
        'id', 'title', 'department', 'location', 'employmentType',
        'description', 'responsibilities', 'qualifications',
        'salaryMin', 'salaryMax', 'currency', 'postedDate', 'closingDate',
      ],
    });
  }

  async findOne(id: string) {
    const j = await this.repo.findOne({ where: { id } });
    if (!j) throw new NotFoundException('Job opening not found');
    return j;
  }

  create(dto: CreateJobDto) {
    return this.repo.save(this.repo.create({
      ...dto,
      postedDate: dto.postedDate ? new Date(dto.postedDate) : new Date(),
    } as any));
  }

  async update(id: string, dto: Partial<CreateJobDto>) {
    const j = await this.findOne(id);
    Object.assign(j, dto);
    return this.repo.save(j);
  }

  async remove(id: string) {
    const j = await this.findOne(id);
    j.isActive = false;
    return this.repo.save(j);
  }
}

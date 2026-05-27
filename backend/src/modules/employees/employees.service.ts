import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './dto/employee.dto';
import { NumberingService } from '@common/services/numbering.service';
import { EmploymentStatus } from '@common/enums';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
    private readonly numbering: NumberingService,
  ) {}

  async create(dto: CreateEmployeeDto, userId: string): Promise<Employee> {
    // Auto-generate EMP-YYYY-NNN if not provided
    const employeeId = dto.employeeId || await this.numbering.next('EMP');

    const exists = await this.repo.findOne({ where: { employeeId } });
    if (exists) throw new ConflictException('Employee ID already exists');

    const emailExists = await this.repo.findOne({ where: { email: dto.email } });
    if (emailExists) throw new ConflictException('Email already registered');

    const emp = this.repo.create({
      ...dto,
      employeeId,
      middleName: dto.middleName || '',
      createdBy: userId,
    });
    return this.repo.save(emp);
  }

  async createFromTrainee(traineeData: Partial<CreateEmployeeDto>, userId: string): Promise<Employee> {
    const employeeId = await this.numbering.next('EMP');

    const emp = this.repo.create({
      ...traineeData,
      employeeId,
      middleName: traineeData.middleName || '',
      employmentStatus: EmploymentStatus.PROBATIONARY,
      dateHired: traineeData.dateHired || new Date().toISOString().split('T')[0],
      createdBy: userId,
    });
    return this.repo.save(emp);
  }

  async findAll(query: QueryEmployeeDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('e').where('e.deleted_at IS NULL');

    if (query.search) {
      qb.andWhere(
        `(e.firstName ILIKE :s OR e.lastName ILIKE :s OR e.email ILIKE :s
         OR e.employeeId ILIKE :s OR e.position ILIKE :s)`,
        { s: `%${query.search}%` },
      );
    }
    if (query.employmentStatus) qb.andWhere('e.employmentStatus = :st', { st: query.employmentStatus });
    if (query.department) qb.andWhere('e.department = :d', { d: query.department });
    if (query.branch) qb.andWhere('e.branch = :b', { b: query.branch });

    qb.orderBy('e.lastName', 'ASC').addOrderBy('e.firstName', 'ASC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<Employee> {
    const emp = await this.repo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async update(id: string, dto: UpdateEmployeeDto, userId: string): Promise<Employee> {
    const emp = await this.findOne(id);
    Object.assign(emp, dto, { updatedBy: userId });
    return this.repo.save(emp);
  }

  async remove(id: string): Promise<void> {
    const emp = await this.findOne(id);
    await this.repo.softRemove(emp);
  }

  async countByStatus() {
    return this.repo.createQueryBuilder('e')
      .select('e.employmentStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('e.deleted_at IS NULL')
      .groupBy('e.employmentStatus')
      .getRawMany();
  }

  async countByDepartment() {
    return this.repo.createQueryBuilder('e')
      .select('e.department', 'department')
      .addSelect('COUNT(*)', 'count')
      .where('e.deleted_at IS NULL')
      .groupBy('e.department')
      .getRawMany();
  }
}

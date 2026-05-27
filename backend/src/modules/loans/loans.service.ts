import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan, LoanStatus } from './entities/loan.entity';
import { CreateLoanDto, UpdateLoanDto, QueryLoanDto } from './dto/loan.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly repo: Repository<Loan>,
  ) {}

  async create(dto: CreateLoanDto, userId: string): Promise<Loan> {
    const loan = this.repo.create({
      ...dto,
      outstandingBalance: dto.principalAmount,
      status: LoanStatus.ACTIVE,
      createdBy: userId,
    });
    return this.repo.save(loan);
  }

  async findAll(query: QueryLoanDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('l')
      .leftJoinAndSelect('l.employee', 'e')
      .where('l.deleted_at IS NULL');

    if (query.employeeId) qb.andWhere('l.employeeId = :eid', { eid: query.employeeId });
    if (query.loanType) qb.andWhere('l.loanType = :lt', { lt: query.loanType });
    if (query.status) qb.andWhere('l.status = :st', { st: query.status });
    if (query.search) {
      qb.andWhere(
        '(e.firstName ILIKE :s OR e.lastName ILIKE :s OR e.employeeId ILIKE :s OR l.loanReference ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.orderBy('l.created_at', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<Loan> {
    const loan = await this.repo.findOne({ where: { id }, relations: ['employee'] });
    if (!loan) throw new NotFoundException('Loan not found');
    return loan;
  }

  async update(id: string, dto: UpdateLoanDto, userId: string): Promise<Loan> {
    const loan = await this.findOne(id);
    Object.assign(loan, dto, { updatedBy: userId });
    return this.repo.save(loan);
  }

  async remove(id: string): Promise<void> {
    const loan = await this.findOne(id);
    await this.repo.softRemove(loan);
  }

  async getEmployeeTotalLoans(employeeId: string) {
    const result = await this.repo
      .createQueryBuilder('l')
      .select('SUM(l.outstandingBalance)', 'totalOutstanding')
      .addSelect('COUNT(*)', 'count')
      .where('l.employeeId = :eid AND l.status = :st AND l.deleted_at IS NULL', {
        eid: employeeId, st: LoanStatus.ACTIVE,
      })
      .getRawOne();
    return result;
  }
}

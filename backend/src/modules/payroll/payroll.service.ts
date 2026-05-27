import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll, PayrollStatus } from './entities/payroll.entity';
import { GeneratePayrollDto, UpdatePayrollDto, QueryPayrollDto } from './dto/payroll.dto';
import { Employee } from '../employees/entities/employee.entity';
import { Attendance } from '../attendance/entities/attendance.entity';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll) private readonly repo: Repository<Payroll>,
    @InjectRepository(Employee) private readonly empRepo: Repository<Employee>,
    @InjectRepository(Attendance) private readonly attRepo: Repository<Attendance>,
  ) {}

  async generate(dto: GeneratePayrollDto, userId: string): Promise<Payroll[]> {
    const payPeriod = `${dto.payDateFrom}_${dto.payDateTo}`;

    // Get employees
    const empQb = this.empRepo.createQueryBuilder('e')
      .where('e.deleted_at IS NULL AND e.employmentStatus IN (:...st)', {
        st: ['probationary', 'regular'],
      });
    if (dto.department) empQb.andWhere('e.department = :d', { d: dto.department });
    if (dto.employeeId) empQb.andWhere('e.id = :eid', { eid: dto.employeeId });

    const employees = await empQb.getMany();
    const generated: Payroll[] = [];

    for (const emp of employees) {
      // Check if already generated
      const existing = await this.repo.findOne({
        where: { employeeId: emp.id, payPeriod },
      });
      if (existing) continue;

      // Get attendance for period
      const attendance = await this.attRepo.createQueryBuilder('a')
        .where('a.employeeId = :eid AND a.date >= :from AND a.date <= :to AND a.deleted_at IS NULL', {
          eid: emp.id, from: dto.payDateFrom, to: dto.payDateTo,
        })
        .getMany();

      const daysWorked = attendance.filter((a) => a.hoursWorked > 0).length;
      const totalHours = attendance.reduce((s, a) => s + Number(a.hoursWorked || 0), 0);
      const totalOT = attendance.reduce((s, a) => s + Number(a.overtimeHours || 0), 0);
      const totalLate = attendance.reduce((s, a) => s + Number(a.lateMinutes || 0), 0);
      const daysAbsent = this.countWorkingDays(dto.payDateFrom, dto.payDateTo) - daysWorked;

      const dailyRate = Number(emp.dailyRate) || (Number(emp.basicSalary) / 26);
      const hourlyRate = dailyRate / 8;

      const basicPay = Math.round(daysWorked * dailyRate * 100) / 100;
      const overtimePay = Math.round(totalOT * hourlyRate * 1.25 * 100) / 100;
      const lateDeduction = Math.round((totalLate / 60) * hourlyRate * 100) / 100;
      const absentDeduction = Math.round(daysAbsent * dailyRate * 100) / 100;
      const allowance = Number(emp.allowance) || 0;

      const grossPay = basicPay + overtimePay + allowance;

      // PH statutory deductions (simplified)
      const sss = this.computeSSS(grossPay * 2); // monthly estimate
      const philhealth = this.computePhilHealth(grossPay * 2);
      const pagibig = this.computePagIBIG(grossPay * 2);
      const tax = this.computeTax(grossPay * 2, sss, philhealth, pagibig);

      // Semi-monthly share
      const sssContribution = Math.round(sss / 2 * 100) / 100;
      const philhealthContribution = Math.round(philhealth / 2 * 100) / 100;
      const pagibigContribution = Math.round(pagibig / 2 * 100) / 100;
      const withholdingTax = Math.round(tax / 2 * 100) / 100;

      const totalDeductions = sssContribution + philhealthContribution +
        pagibigContribution + withholdingTax + lateDeduction + absentDeduction;
      const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

      const payroll = this.repo.create({
        employeeId: emp.id,
        payPeriod,
        payDateFrom: dto.payDateFrom,
        payDateTo: dto.payDateTo,
        basicPay, overtimePay, allowance,
        grossPay,
        sssContribution, philhealthContribution, pagibigContribution, withholdingTax,
        lateDeduction, absentDeduction,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        netPay,
        daysWorked, daysAbsent, totalOvertimeHours: totalOT, totalLateMinutes: totalLate,
        status: PayrollStatus.DRAFT,
        createdBy: userId,
      });
      generated.push(await this.repo.save(payroll));
    }

    return generated;
  }

  async findAll(query: QueryPayrollDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.employee', 'e')
      .where('p.deleted_at IS NULL');

    if (query.employeeId) qb.andWhere('p.employeeId = :eid', { eid: query.employeeId });
    if (query.payPeriod) qb.andWhere('p.payPeriod = :pp', { pp: query.payPeriod });
    if (query.status) qb.andWhere('p.status = :st', { st: query.status });
    if (query.department) qb.andWhere('e.department = :dep', { dep: query.department });

    qb.orderBy('p.created_at', 'DESC').skip(skip).take(limit);
    const [data, total] = await qb.getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<Payroll> {
    const rec = await this.repo.findOne({ where: { id }, relations: ['employee'] });
    if (!rec) throw new NotFoundException('Payroll record not found');
    return rec;
  }

  async update(id: string, dto: UpdatePayrollDto, userId: string): Promise<Payroll> {
    const rec = await this.findOne(id);
    Object.assign(rec, dto);

    // Recalculate totals if earnings/deductions changed
    rec.grossPay = Number(rec.basicPay) + Number(rec.overtimePay) + Number(rec.holidayPay) +
      Number(rec.nightDiffPay) + Number(rec.allowance) + Number(rec.otherEarnings);
    rec.totalDeductions = Number(rec.sssContribution) + Number(rec.philhealthContribution) +
      Number(rec.pagibigContribution) + Number(rec.withholdingTax) + Number(rec.lateDeduction) +
      Number(rec.absentDeduction) + Number(rec.loanDeduction) + Number(rec.otherDeductions);
    rec.netPay = Math.round((rec.grossPay - rec.totalDeductions) * 100) / 100;
    rec.updatedBy = userId;

    if (dto.status === PayrollStatus.APPROVED) {
      rec.approvedBy = userId;
      rec.approvedAt = new Date();
    }

    return this.repo.save(rec);
  }

  async remove(id: string): Promise<void> {
    const rec = await this.findOne(id);
    await this.repo.softRemove(rec);
  }

  // Simplified PH SSS (2024 table)
  private computeSSS(monthlySalary: number): number {
    if (monthlySalary <= 4250) return 180;
    if (monthlySalary >= 29750) return 1350;
    return Math.min(1350, Math.round(((monthlySalary - 4250) / 500) * 22.5 + 180));
  }

  private computePhilHealth(monthlySalary: number): number {
    const premium = monthlySalary * 0.05;
    const share = Math.min(premium / 2, 500);
    return Math.round(share * 100) / 100;
  }

  private computePagIBIG(monthlySalary: number): number {
    if (monthlySalary <= 1500) return monthlySalary * 0.01;
    return Math.min(monthlySalary * 0.02, 200);
  }

  private computeTax(monthly: number, sss: number, ph: number, pi: number): number {
    const taxable = monthly - sss - ph - pi;
    if (taxable <= 20833) return 0;
    if (taxable <= 33333) return (taxable - 20833) * 0.15;
    if (taxable <= 66667) return 1875 + (taxable - 33333) * 0.20;
    if (taxable <= 166667) return 8541.80 + (taxable - 66667) * 0.25;
    if (taxable <= 666667) return 33541.80 + (taxable - 166667) * 0.30;
    return 183541.80 + (taxable - 666667) * 0.35;
  }

  private countWorkingDays(from: string, to: string): number {
    let count = 0;
    const d = new Date(from);
    const end = new Date(to);
    while (d <= end) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) count++;
      d.setDate(d.getDate() + 1);
    }
    return count;
  }
}

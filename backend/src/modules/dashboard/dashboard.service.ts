import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { Applicant } from '../applicants/entities/applicant.entity';
import { Trainee } from '../trainees/entities/trainee.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Payroll } from '../payroll/entities/payroll.entity';
import { ExitClearance } from '../exit-clearance/entities/exit-clearance.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(Applicant) private appRepo: Repository<Applicant>,
    @InjectRepository(Trainee) private traineeRepo: Repository<Trainee>,
    @InjectRepository(Attendance) private attRepo: Repository<Attendance>,
    @InjectRepository(Payroll) private payRepo: Repository<Payroll>,
    @InjectRepository(ExitClearance) private exitRepo: Repository<ExitClearance>,
  ) {}

  async getOverviewStats() {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalEmployees,
      activeEmployees,
      totalApplicants,
      newApplicants,
      totalTrainees,
      presentToday,
      absentToday,
      lateToday,
      pendingClearance,
      pendingPayroll,
    ] = await Promise.all([
      this.empRepo.count({ where: { deletedAt: null as any } }),
      this.empRepo.createQueryBuilder('e')
        .where('e.deleted_at IS NULL AND e.employmentStatus IN (:...s)', { s: ['probationary', 'regular'] })
        .getCount(),
      this.appRepo.count({ where: { deletedAt: null as any } }),
      this.appRepo.createQueryBuilder('a')
        .where("a.deleted_at IS NULL AND a.status = 'new'")
        .getCount(),
      this.traineeRepo.createQueryBuilder('t')
        .where("t.deleted_at IS NULL AND t.status = 'ongoing'")
        .getCount(),
      this.attRepo.createQueryBuilder('a')
        .where("a.date = :d AND a.deleted_at IS NULL AND a.status IN ('present', 'late')", { d: today })
        .getCount(),
      this.attRepo.createQueryBuilder('a')
        .where("a.date = :d AND a.deleted_at IS NULL AND a.status = 'absent'", { d: today })
        .getCount(),
      this.attRepo.createQueryBuilder('a')
        .where("a.date = :d AND a.deleted_at IS NULL AND a.status = 'late'", { d: today })
        .getCount(),
      this.exitRepo.createQueryBuilder('e')
        .where("e.deleted_at IS NULL AND e.status IN ('pending', 'in_progress')")
        .getCount(),
      this.payRepo.createQueryBuilder('p')
        .where("p.deleted_at IS NULL AND p.status = 'draft'")
        .getCount(),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      totalApplicants,
      newApplicants,
      totalTrainees,
      presentToday,
      absentToday,
      lateToday,
      pendingClearance,
      pendingPayroll,
    };
  }

  async getEmployeesByDepartment() {
    return this.empRepo.createQueryBuilder('e')
      .select('e.department', 'label')
      .addSelect('COUNT(*)', 'value')
      .where("e.deleted_at IS NULL AND e.employmentStatus IN ('probationary', 'regular')")
      .groupBy('e.department')
      .orderBy('value', 'DESC')
      .getRawMany();
  }

  async getEmployeesByStatus() {
    return this.empRepo.createQueryBuilder('e')
      .select('e.employmentStatus', 'label')
      .addSelect('COUNT(*)', 'value')
      .where('e.deleted_at IS NULL')
      .groupBy('e.employmentStatus')
      .getRawMany();
  }

  async getApplicantsByStatus() {
    return this.appRepo.createQueryBuilder('a')
      .select('a.status', 'label')
      .addSelect('COUNT(*)', 'value')
      .where('a.deleted_at IS NULL')
      .groupBy('a.status')
      .getRawMany();
  }

  async getAttendanceTrend() {
    // Last 14 days attendance summary
    const result = await this.attRepo.createQueryBuilder('a')
      .select('a.date', 'date')
      .addSelect("SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END)", 'present')
      .addSelect("SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END)", 'absent')
      .addSelect("SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END)", 'late')
      .where("a.deleted_at IS NULL AND a.date >= CURRENT_DATE - INTERVAL '14 days'")
      .groupBy('a.date')
      .orderBy('a.date', 'ASC')
      .getRawMany();
    return result;
  }

  async getPayrollSummary() {
    // Last 6 pay periods
    return this.payRepo.createQueryBuilder('p')
      .select('p.payPeriod', 'period')
      .addSelect('SUM(p.grossPay)', 'totalGross')
      .addSelect('SUM(p.totalDeductions)', 'totalDeductions')
      .addSelect('SUM(p.netPay)', 'totalNet')
      .addSelect('COUNT(*)', 'headcount')
      .where('p.deleted_at IS NULL')
      .groupBy('p.payPeriod')
      .orderBy('p.payPeriod', 'DESC')
      .limit(6)
      .getRawMany();
  }

  async getRecentHires() {
    return this.empRepo.createQueryBuilder('e')
      .where('e.deleted_at IS NULL')
      .orderBy('e.dateHired', 'DESC')
      .limit(5)
      .getMany();
  }

  async getUpcomingEvents() {
    const events: any[] = [];

    // Contracts ending in 30 days
    const expiring = await this.empRepo.createQueryBuilder('e')
      .where("e.deleted_at IS NULL AND e.contractEndDate IS NOT NULL AND e.contractEndDate <= CURRENT_DATE + INTERVAL '30 days' AND e.contractEndDate >= CURRENT_DATE")
      .orderBy('e.contractEndDate', 'ASC')
      .limit(5)
      .getMany();
    expiring.forEach((e) => events.push({
      type: 'contract_expiry',
      title: `${e.firstName} ${e.lastName} - Contract ending`,
      date: e.contractEndDate,
      employee: { id: e.id, name: `${e.firstName} ${e.lastName}` },
    }));

    // Pending clearance
    const clearances = await this.exitRepo.createQueryBuilder('ec')
      .leftJoinAndSelect('ec.employee', 'e')
      .where("ec.deleted_at IS NULL AND ec.status IN ('pending', 'in_progress')")
      .orderBy('ec.lastWorkingDay', 'ASC')
      .limit(5)
      .getMany();
    clearances.forEach((c) => events.push({
      type: 'exit_clearance',
      title: `${c.employee?.firstName} ${c.employee?.lastName} - Exit clearance`,
      date: c.lastWorkingDay,
      employee: { id: c.employee?.id, name: `${c.employee?.firstName} ${c.employee?.lastName}` },
    }));

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 10);
  }
}

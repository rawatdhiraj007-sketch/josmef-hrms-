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

  // ─── Widget: Birthdays this month ──────────────────────────────────
  async getBirthdaysThisMonth() {
    const month = new Date().getMonth() + 1;
    const rows = await this.empRepo.createQueryBuilder('e')
      .where('e.deleted_at IS NULL AND e."dateOfBirth" IS NOT NULL')
      .andWhere('EXTRACT(MONTH FROM e."dateOfBirth") = :month', { month })
      .andWhere(`e."employmentStatus" IN ('regular', 'probationary', 'trainee')`)
      .orderBy('EXTRACT(DAY FROM e."dateOfBirth")', 'ASC')
      .limit(20)
      .getMany();
    return rows.map(e => ({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      department: (e as any).department,
      position: (e as any).position,
      day: new Date(e.dateOfBirth).getDate(),
      dateOfBirth: e.dateOfBirth,
    }));
  }

  // ─── Widget: Who's on approved leave today ──────────────────────────
  async getOnLeaveToday() {
    return this.empRepo.manager.query(
      `SELECT
         lr.id,
         lr."totalDays",
         lr."startDate",
         lr."endDate",
         lt.code AS "leaveCode",
         lt.name AS "leaveName",
         e.id AS "employeeId",
         e."firstName",
         e."lastName",
         e."employeeId" AS "empNumber",
         e.department AS "department"
       FROM leave_requests lr
       JOIN leave_types lt ON lt.id = lr."leaveTypeId"
       JOIN employees e ON e.id = lr."employeeId"
       WHERE lr.status = 'approved'
         AND lr."startDate" <= CURRENT_DATE
         AND lr."endDate" >= CURRENT_DATE
       ORDER BY e."lastName"
       LIMIT 20`,
    ).catch(() => []);
  }

  // ─── Widget: Expiring contracts (next 30 days) ──────────────────────
  async getExpiringContracts() {
    return this.empRepo.createQueryBuilder('e')
      .where("e.deleted_at IS NULL AND e.\"contractEndDate\" IS NOT NULL")
      .andWhere(`e."contractEndDate" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`)
      .andWhere(`e."employmentStatus" IN ('regular', 'probationary', 'trainee')`)
      .orderBy('e."contractEndDate"', 'ASC')
      .limit(10)
      .getMany();
  }

  // ─── Widget: Recent payroll runs ────────────────────────────────────
  async getRecentPayroll() {
    return this.empRepo.manager.query(
      `SELECT
         p.id,
         p."payDateFrom",
         p."payDateTo",
         p."payDay",
         p.status,
         SUM(p."grossPay")::float AS "totalGross",
         SUM(p."netPay")::float AS "totalNet",
         COUNT(DISTINCT p."employeeId")::int AS "employeeCount"
       FROM payroll p
       WHERE p.deleted_at IS NULL
       GROUP BY p.id, p."payDateFrom", p."payDateTo", p."payDay", p.status
       ORDER BY p."payDateTo" DESC
       LIMIT 5`,
    ).catch(() => []);
  }

  // ─── Widget: Philippine public holidays (static list) ───────────────
  getUpcomingHolidays() {
    const year = new Date().getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const PH_HOLIDAYS = [
      { date: `${year}-01-01`, name: "New Year's Day", type: 'regular' },
      { date: `${year}-04-09`, name: 'Day of Valor (Araw ng Kagitingan)', type: 'regular' },
      { date: `${year}-04-17`, name: 'Maundy Thursday', type: 'regular' },
      { date: `${year}-04-18`, name: 'Good Friday', type: 'regular' },
      { date: `${year}-05-01`, name: 'Labor Day', type: 'regular' },
      { date: `${year}-06-12`, name: 'Independence Day', type: 'regular' },
      { date: `${year}-08-25`, name: 'National Heroes Day', type: 'regular' },
      { date: `${year}-11-30`, name: 'Bonifacio Day', type: 'regular' },
      { date: `${year}-12-25`, name: 'Christmas Day', type: 'regular' },
      { date: `${year}-12-30`, name: 'Rizal Day', type: 'regular' },
      { date: `${year}-02-25`, name: 'EDSA Revolution Anniversary', type: 'special' },
      { date: `${year}-08-21`, name: 'Ninoy Aquino Day', type: 'special' },
      { date: `${year}-11-01`, name: "All Saints' Day", type: 'special' },
      { date: `${year}-12-08`, name: 'Feast of the Immaculate Conception', type: 'special' },
      { date: `${year}-12-24`, name: 'Christmas Eve', type: 'special' },
      { date: `${year}-12-31`, name: "New Year's Eve", type: 'special' },
    ];

    return PH_HOLIDAYS
      .filter(h => new Date(h.date) >= today)
      .slice(0, 8);
  }

  // ─── Combined widgets endpoint (one round-trip) ─────────────────────
  async getWidgets() {
    const [birthdays, onLeave, expiring, recentPayroll] = await Promise.all([
      this.getBirthdaysThisMonth(),
      this.getOnLeaveToday(),
      this.getExpiringContracts(),
      this.getRecentPayroll(),
    ]);
    return {
      birthdays,
      onLeave,
      expiringContracts: expiring.map(e => ({
        id: e.id,
        firstName: e.firstName,
        lastName: e.lastName,
        department: (e as any).department,
        position: (e as any).position,
        contractEndDate: e.contractEndDate,
        daysLeft: Math.ceil(
          (new Date(e.contractEndDate).getTime() - Date.now()) / 86400000,
        ),
      })),
      recentPayroll,
      holidays: this.getUpcomingHolidays(),
    };
  }
}

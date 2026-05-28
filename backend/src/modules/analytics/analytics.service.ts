import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(private readonly dataSource: DataSource) {}

  // Headcount trend by month over the last N months
  async headcountTrend(months = 12) {
    const sql = `
      WITH RECURSIVE months AS (
        SELECT date_trunc('month', CURRENT_DATE) - INTERVAL '${months - 1} months' AS m
        UNION ALL
        SELECT m + INTERVAL '1 month' FROM months WHERE m < date_trunc('month', CURRENT_DATE)
      )
      SELECT
        TO_CHAR(m, 'YYYY-MM') AS month,
        (SELECT COUNT(*)::int FROM employees e
          WHERE COALESCE(e."dateHired", e."created_at") <= (m + INTERVAL '1 month - 1 day')
            AND (e."employmentStatus" IN ('regular', 'probationary', 'trainee')
                 OR (e."employmentStatus" IN ('resigned', 'terminated', 'end_of_contract', 'awol')
                     AND e."updated_at" > (m + INTERVAL '1 month - 1 day'))
                )
        ) AS headcount
      FROM months
      ORDER BY m`;
    return this.dataSource.query(sql).catch(() => []);
  }

  // Payroll cost by month
  async payrollCost(months = 12) {
    return this.dataSource.query(
      `SELECT
         TO_CHAR(date_trunc('month', "payDateTo"), 'YYYY-MM') AS month,
         SUM("grossPay")::float AS gross,
         SUM("netPay")::float AS net,
         SUM("withholdingTax")::float AS tax
       FROM payroll
       WHERE "payDateTo" >= CURRENT_DATE - INTERVAL '${months} months'
       GROUP BY date_trunc('month', "payDateTo")
       ORDER BY 1`,
    ).catch(() => []);
  }

  // Leave usage by type for current year
  async leaveUsage() {
    return this.dataSource.query(
      `SELECT
         lt.code,
         lt.name,
         COUNT(lr.id)::int AS "requestCount",
         COALESCE(SUM(CASE WHEN lr.status = 'approved' THEN lr."totalDays" ELSE 0 END), 0)::float AS "daysApproved",
         COALESCE(SUM(CASE WHEN lr.status = 'pending' THEN lr."totalDays" ELSE 0 END), 0)::float AS "daysPending"
       FROM leave_types lt
       LEFT JOIN leave_requests lr ON lr."leaveTypeId" = lt.id
         AND EXTRACT(YEAR FROM lr."startDate") = EXTRACT(YEAR FROM CURRENT_DATE)
       GROUP BY lt.id, lt.code, lt.name
       ORDER BY "daysApproved" DESC NULLS LAST`,
    ).catch(() => []);
  }

  // Attendance breakdown for current month
  async attendanceBreakdown() {
    return this.dataSource.query(
      `SELECT
         type,
         COUNT(*)::int AS count
       FROM attendance
       WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
         AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
       GROUP BY type`,
    ).catch(() => []);
  }

  // Department distribution
  async departmentDistribution() {
    return this.dataSource.query(
      `SELECT
         COALESCE("department", 'Unassigned') AS department,
         COUNT(*)::int AS headcount
       FROM employees
       WHERE "employmentStatus" IN ('regular', 'probationary', 'trainee')
       GROUP BY department
       ORDER BY headcount DESC`,
    ).catch(() => []);
  }

  // Applicant funnel
  async applicantFunnel() {
    return this.dataSource.query(
      `SELECT
         status,
         COUNT(*)::int AS count
       FROM applicants
       GROUP BY status
       ORDER BY count DESC`,
    ).catch(() => []);
  }

  async overview() {
    const [trend, cost, leave, attendance, dept, funnel] = await Promise.all([
      this.headcountTrend(12),
      this.payrollCost(12),
      this.leaveUsage(),
      this.attendanceBreakdown(),
      this.departmentDistribution(),
      this.applicantFunnel(),
    ]);
    return { trend, cost, leave, attendance, dept, funnel };
  }
}

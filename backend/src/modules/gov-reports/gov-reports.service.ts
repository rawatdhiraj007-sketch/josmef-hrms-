import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface ReportRow {
  [key: string]: any;
}

@Injectable()
export class GovReportsService {
  constructor(private readonly dataSource: DataSource) {}

  // ─── SSS R-3 Monthly Contribution Report ──────────────────────────────
  async sssR3(year: number, month: number) {
    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    const rows: ReportRow[] = await this.dataSource.query(
      `SELECT
         e."employeeId" AS "ssNumber",
         CONCAT(e."lastName", ', ', e."firstName", ' ', COALESCE(e."middleName", '')) AS "employeeName",
         SUM(p."basicPay") AS "monthlyCompensation",
         SUM(p."sssContribution") AS "eeShare",
         ROUND(SUM(p."sssContribution") * 2.0, 2) AS "erShare",
         ROUND(SUM(p."sssContribution") * 3.0, 2) AS "totalContribution"
       FROM payroll p
       JOIN employees e ON e.id = p."employeeId"
       WHERE p."payDateTo" BETWEEN $1 AND $2
       GROUP BY e.id, e."employeeId", e."lastName", e."firstName", e."middleName"
       ORDER BY e."lastName"`,
      [start, end],
    ).catch(() => []);

    const totals = rows.reduce(
      (acc, r) => ({
        compensation: acc.compensation + Number(r.monthlyCompensation || 0),
        eeShare: acc.eeShare + Number(r.eeShare || 0),
        erShare: acc.erShare + Number(r.erShare || 0),
        total: acc.total + Number(r.totalContribution || 0),
      }),
      { compensation: 0, eeShare: 0, erShare: 0, total: 0 },
    );

    return { form: 'SSS R-3', period: `${year}-${String(month).padStart(2, '0')}`, rows, totals };
  }

  // ─── PhilHealth RF-1 ────────────────────────────────────────────────
  async philhealthRF1(year: number, month: number) {
    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    const rows: ReportRow[] = await this.dataSource.query(
      `SELECT
         e."employeeId" AS "pinNumber",
         CONCAT(e."lastName", ', ', e."firstName", ' ', COALESCE(e."middleName", '')) AS "employeeName",
         SUM(p."basicPay") AS "salaryBase",
         SUM(p."philhealthContribution") AS "eePremium",
         SUM(p."philhealthContribution") AS "erPremium",
         SUM(p."philhealthContribution") * 2 AS "totalPremium"
       FROM payroll p
       JOIN employees e ON e.id = p."employeeId"
       WHERE p."payDateTo" BETWEEN $1 AND $2
       GROUP BY e.id, e."employeeId", e."lastName", e."firstName", e."middleName"
       ORDER BY e."lastName"`,
      [start, end],
    ).catch(() => []);

    const totals = rows.reduce(
      (acc, r) => ({
        salary: acc.salary + Number(r.salaryBase || 0),
        ee: acc.ee + Number(r.eePremium || 0),
        er: acc.er + Number(r.erPremium || 0),
        total: acc.total + Number(r.totalPremium || 0),
      }),
      { salary: 0, ee: 0, er: 0, total: 0 },
    );

    return { form: 'PhilHealth RF-1', period: `${year}-${String(month).padStart(2, '0')}`, rows, totals };
  }

  // ─── Pag-IBIG MCRF (Member Contribution Remittance Form) ─────────────
  async pagibigMCRF(year: number, month: number) {
    const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    const rows: ReportRow[] = await this.dataSource.query(
      `SELECT
         e."employeeId" AS "mid",
         CONCAT(e."lastName", ', ', e."firstName", ' ', COALESCE(e."middleName", '')) AS "employeeName",
         SUM(p."basicPay") AS "monthlyComp",
         SUM(p."pagibigContribution") AS "eeShare",
         SUM(p."pagibigContribution") AS "erShare",
         SUM(p."pagibigContribution") * 2 AS "totalContribution"
       FROM payroll p
       JOIN employees e ON e.id = p."employeeId"
       WHERE p."payDateTo" BETWEEN $1 AND $2
       GROUP BY e.id, e."employeeId", e."lastName", e."firstName", e."middleName"
       ORDER BY e."lastName"`,
      [start, end],
    ).catch(() => []);

    const totals = rows.reduce(
      (acc, r) => ({
        compensation: acc.compensation + Number(r.monthlyComp || 0),
        ee: acc.ee + Number(r.eeShare || 0),
        er: acc.er + Number(r.erShare || 0),
        total: acc.total + Number(r.totalContribution || 0),
      }),
      { compensation: 0, ee: 0, er: 0, total: 0 },
    );

    return { form: 'Pag-IBIG MCRF', period: `${year}-${String(month).padStart(2, '0')}`, rows, totals };
  }

  // ─── BIR 2316 — Annual Withholding Tax Certificate ──────────────────
  async bir2316(year: number) {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    const rows: ReportRow[] = await this.dataSource.query(
      `SELECT
         e."employeeId" AS "employeeNumber",
         CONCAT(e."lastName", ', ', e."firstName", ' ', COALESCE(e."middleName", '')) AS "employeeName",
         e."email" AS "email",
         SUM(p."basicPay") AS "grossCompensation",
         SUM(p."sssContribution") AS "sssTotal",
         SUM(p."philhealthContribution") AS "philhealthTotal",
         SUM(p."pagibigContribution") AS "pagibigTotal",
         SUM(p."sssContribution" + p."philhealthContribution" + p."pagibigContribution") AS "totalMandatoryContributions",
         SUM(p."withholdingTax") AS "taxWithheld",
         SUM(p."netPay") AS "netCompensation"
       FROM payroll p
       JOIN employees e ON e.id = p."employeeId"
       WHERE p."payDateTo" BETWEEN $1 AND $2
       GROUP BY e.id, e."employeeId", e."lastName", e."firstName", e."middleName", e."email"
       ORDER BY e."lastName"`,
      [start, end],
    ).catch(() => []);
    return { form: 'BIR 2316', period: String(year), rows };
  }

  // ─── BIR Alphalist (annual) ─────────────────────────────────────────
  async birAlphalist(year: number) {
    // Reuse 2316 — alphalist is same dataset, different presentation
    const r = await this.bir2316(year);
    return { ...r, form: 'BIR Alphalist (Schedule 7.1)' };
  }

  // ─── Helper: convert to CSV ─────────────────────────────────────────
  toCSV(data: { rows: ReportRow[] }): string {
    if (!data.rows?.length) return '';
    const keys = Object.keys(data.rows[0]);
    const escape = (v: any) => {
      if (v == null) return '';
      const s = String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const header = keys.join(',');
    const body = data.rows.map((r) => keys.map((k) => escape(r[k])).join(',')).join('\n');
    return `${header}\n${body}`;
  }
}

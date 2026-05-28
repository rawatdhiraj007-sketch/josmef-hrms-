import { Injectable } from '@nestjs/common';
import { DataSource, LessThan, In } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { Loan, LoanStatus } from '../loans/entities/loan.entity';
import { NteRecord, NteStatus } from '../nte/entities/nte.entity';
import { ExitClearance, ClearanceStatus } from '../exit-clearance/entities/exit-clearance.entity';
import { DisciplinaryAction, DisciplinaryStatus } from '../disciplinary/entities/disciplinary.entity';
import { EmploymentStatus } from '@common/enums';

export interface ComplianceAlert {
  id: string;
  type: 'loan_separation' | 'nte_overdue' | 'clearance_overdue' | 'contract_expiring' | 'disciplinary_stale';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  employeeId?: string;
  employeeName?: string;
  employeeNumber?: string;
  referenceId?: string;
  referenceNumber?: string;
  dueDate?: string;
  daysOverdue?: number;
  link?: string;
}

@Injectable()
export class ComplianceService {
  constructor(private readonly dataSource: DataSource) {}

  async getAlerts(): Promise<{ alerts: ComplianceAlert[]; summary: Record<string, number> }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alerts: ComplianceAlert[] = [];

    const empRepo = this.dataSource.getRepository(Employee);
    const loanRepo = this.dataSource.getRepository(Loan);
    const nteRepo = this.dataSource.getRepository(NteRecord);
    const clearanceRepo = this.dataSource.getRepository(ExitClearance);
    const discRepo = this.dataSource.getRepository(DisciplinaryAction);

    // 1. Active loans for separated employees
    const separatedStatuses = [
      EmploymentStatus.RESIGNED,
      EmploymentStatus.TERMINATED,
      EmploymentStatus.END_OF_CONTRACT,
      EmploymentStatus.AWOL,
    ];
    const separatedEmployees = await empRepo.find({
      where: separatedStatuses.map((s) => ({ employmentStatus: s })),
      select: ['id', 'employeeId', 'firstName', 'middleName', 'lastName'],
    });
    if (separatedEmployees.length > 0) {
      const sepIds = separatedEmployees.map((e) => e.id);
      const activeLoans = await loanRepo.find({
        where: { employeeId: In(sepIds), status: LoanStatus.ACTIVE },
      });
      for (const loan of activeLoans) {
        const emp = separatedEmployees.find((e) => e.id === loan.employeeId);
        if (emp) {
          alerts.push({
            id: `loan-sep-${loan.id}`,
            type: 'loan_separation',
            severity: 'critical',
            title: 'Active Loan — Separated Employee',
            description: `${emp.firstName} ${emp.lastName} has an active ${loan.loanType.replace('_', ' ').toUpperCase()} loan (balance: ₱${Number(loan.outstandingBalance).toLocaleString()}) but is no longer active.`,
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName}`,
            employeeNumber: emp.employeeId,
            referenceId: loan.id,
            link: `/dashboard/loans`,
          });
        }
      }
    }

    // 2. NTEs past reply deadline
    const overdueNtes = await nteRepo.find({
      where: {
        deadlineToReply: LessThan(today) as any,
        status: In([NteStatus.ISSUED, NteStatus.ACKNOWLEDGED]),
      },
      relations: ['employee'],
    });
    for (const nte of overdueNtes) {
      const deadline = new Date(nte.deadlineToReply);
      const daysOverdue = Math.floor((today.getTime() - deadline.getTime()) / 86400000);
      alerts.push({
        id: `nte-overdue-${nte.id}`,
        type: 'nte_overdue',
        severity: daysOverdue > 7 ? 'critical' : 'high',
        title: 'NTE Reply Overdue',
        description: `${nte.employee?.firstName} ${nte.employee?.lastName} has not responded to NTE "${nte.subject}" — ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue.`,
        employeeId: nte.employee?.id,
        employeeName: nte.employee ? `${nte.employee.firstName} ${nte.employee.middleName ? nte.employee.middleName + ' ' : ''}${nte.employee.lastName}` : undefined,
        employeeNumber: nte.employee?.employeeId,
        referenceId: nte.id,
        referenceNumber: nte.nteNumber,
        dueDate: deadline.toISOString().split('T')[0],
        daysOverdue,
        link: `/dashboard/nte`,
      });
    }

    // 3. Exit clearance overdue (last working day passed, still not completed)
    const overdueClearances = await clearanceRepo.find({
      where: {
        lastWorkingDay: LessThan(today) as any,
        status: In([ClearanceStatus.PENDING, ClearanceStatus.IN_PROGRESS]),
      },
      relations: ['employee'],
    });
    for (const clearance of overdueClearances) {
      const lwDate = new Date(clearance.lastWorkingDay);
      const daysOverdue = Math.floor((today.getTime() - lwDate.getTime()) / 86400000);
      alerts.push({
        id: `clearance-overdue-${clearance.id}`,
        type: 'clearance_overdue',
        severity: daysOverdue > 14 ? 'critical' : 'high',
        title: 'Exit Clearance Overdue',
        description: `${clearance.employee?.firstName} ${clearance.employee?.lastName}'s exit clearance is still ${clearance.status.replace('_', ' ')} — last working day was ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago.`,
        employeeId: clearance.employee?.id,
        employeeName: clearance.employee ? `${clearance.employee.firstName} ${clearance.employee.middleName ? clearance.employee.middleName + ' ' : ''}${clearance.employee.lastName}` : undefined,
        employeeNumber: clearance.employee?.employeeId,
        referenceId: clearance.id,
        dueDate: lwDate.toISOString().split('T')[0],
        daysOverdue,
        link: `/dashboard/exit-clearance/${clearance.id}`,
      });
    }

    // 4. Contracts expiring within 7 days
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    const expiringContracts = await empRepo
      .createQueryBuilder('e')
      .where('e.contractEndDate >= :today', { today })
      .andWhere('e.contractEndDate <= :in7Days', { in7Days })
      .andWhere('e.employmentStatus NOT IN (:...separated)', { separated: separatedStatuses })
      .getMany();
    for (const emp of expiringContracts) {
      const endDate = new Date(emp.contractEndDate!);
      const daysLeft = Math.floor((endDate.getTime() - today.getTime()) / 86400000);
      alerts.push({
        id: `contract-exp-${emp.id}`,
        type: 'contract_expiring',
        severity: daysLeft <= 2 ? 'critical' : daysLeft <= 4 ? 'high' : 'medium',
        title: 'Contract Expiring Soon',
        description: `${emp.firstName} ${emp.lastName}'s contract expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} (${endDate.toISOString().split('T')[0]}).`,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName}`,
        employeeNumber: emp.employeeId,
        dueDate: endDate.toISOString().split('T')[0],
        link: `/dashboard/employees/${emp.id}`,
      });
    }

    // 5. Disciplinary cases open > 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const staleDisc = await discRepo.find({
      where: {
        status: In([DisciplinaryStatus.OPEN, DisciplinaryStatus.APPEALED]),
        createdAt: LessThan(thirtyDaysAgo) as any,
      },
      relations: ['employee'],
    });
    for (const disc of staleDisc) {
      const created = new Date(disc.createdAt);
      const daysOld = Math.floor((today.getTime() - created.getTime()) / 86400000);
      alerts.push({
        id: `disc-stale-${disc.id}`,
        type: 'disciplinary_stale',
        severity: daysOld > 60 ? 'high' : 'medium',
        title: 'Unresolved Disciplinary Case',
        description: `${disc.employee?.firstName} ${disc.employee?.lastName}'s ${disc.type.replace(/_/g, ' ')} case for "${disc.offense}" has been open for ${daysOld} days.`,
        employeeId: disc.employee?.id,
        employeeName: disc.employee ? `${disc.employee.firstName} ${disc.employee.middleName ? disc.employee.middleName + ' ' : ''}${disc.employee.lastName}` : undefined,
        employeeNumber: disc.employee?.employeeId,
        referenceId: disc.id,
        link: `/dashboard/disciplinary`,
      });
    }

    // Sort: critical first
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const summary = {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      high: alerts.filter((a) => a.severity === 'high').length,
      medium: alerts.filter((a) => a.severity === 'medium').length,
      loan_separation: alerts.filter((a) => a.type === 'loan_separation').length,
      nte_overdue: alerts.filter((a) => a.type === 'nte_overdue').length,
      clearance_overdue: alerts.filter((a) => a.type === 'clearance_overdue').length,
      contract_expiring: alerts.filter((a) => a.type === 'contract_expiring').length,
      disciplinary_stale: alerts.filter((a) => a.type === 'disciplinary_stale').length,
    };

    return { alerts, summary };
  }
}

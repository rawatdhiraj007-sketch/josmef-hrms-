import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Employee } from '../employees/entities/employee.entity';
import { LeaveRequest, LeaveStatus } from '../leave/entities/leave-request.entity';
import { LeaveService } from '../leave/leave.service';
import { TrainingService } from '../training/training.service';

@Injectable()
export class PortalService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly leaveService: LeaveService,
    private readonly trainingService: TrainingService,
  ) {}

  async getMyTrainings(userEmail: string) {
    const emp = await this.resolveEmployee(userEmail);
    return this.trainingService.getEmployeeEnrollments(emp.id);
  }

  private async resolveEmployee(userEmail: string): Promise<Employee> {
    const repo = this.dataSource.getRepository(Employee);
    const emp = await repo.findOne({ where: { email: userEmail } });
    if (!emp) {
      throw new NotFoundException(
        'No employee record linked to your account. Contact HR.',
      );
    }
    return emp;
  }

  async getMe(userEmail: string) {
    const emp = await this.resolveEmployee(userEmail);
    return {
      id: emp.id,
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      middleName: emp.middleName,
      lastName: emp.lastName,
      email: emp.email,
      mobile: emp.mobile,
      position: (emp as any).position,
      department: (emp as any).department,
      employmentStatus: emp.employmentStatus,
      dateHired: (emp as any).dateHired,
      contractEndDate: emp.contractEndDate,
    };
  }

  async getMyLeaveBalances(userEmail: string, year?: number) {
    const emp = await this.resolveEmployee(userEmail);
    return this.leaveService.getEmployeeBalances(emp.id, year);
  }

  async getMyLeaveRequests(userEmail: string) {
    const emp = await this.resolveEmployee(userEmail);
    return this.leaveService.listRequests({ employeeId: emp.id, limit: 100 });
  }

  async getMyPayslips(userEmail: string) {
    const emp = await this.resolveEmployee(userEmail);
    // Look up payslips - join via payroll items
    const result = await this.dataSource.query(
      `SELECT pi.*, pp.start_date AS "periodStart", pp.end_date AS "periodEnd", pp.cutoff
       FROM payroll_items pi
       LEFT JOIN payroll_periods pp ON pp.id = pi."payrollPeriodId"
       WHERE pi."employeeId" = $1
       ORDER BY pp.start_date DESC NULLS LAST
       LIMIT 24`,
      [emp.id],
    ).catch(() => []);
    return result;
  }

  async getMyAttendance(userEmail: string, month?: string) {
    const emp = await this.resolveEmployee(userEmail);
    let dateFilter = '';
    const params: any[] = [emp.id];
    if (month) {
      const start = `${month}-01`;
      const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth() + 1, 0)
        .toISOString().slice(0, 10);
      dateFilter = `AND date BETWEEN $2 AND $3`;
      params.push(start, end);
    }
    return this.dataSource.query(
      `SELECT * FROM attendance WHERE "employeeId" = $1 ${dateFilter} ORDER BY date DESC LIMIT 90`,
      params,
    ).catch(() => []);
  }

  async createMyLeaveRequest(
    userEmail: string,
    dto: { leaveTypeId: string; startDate: string; endDate: string; reason: string },
  ) {
    const emp = await this.resolveEmployee(userEmail);
    return this.leaveService.createRequest({ employeeId: emp.id, ...dto });
  }
}

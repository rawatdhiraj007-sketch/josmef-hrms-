import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  getStats() {
    return this.service.getOverviewStats();
  }

  @Get('charts/employees-by-department')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  getEmployeesByDept() {
    return this.service.getEmployeesByDepartment();
  }

  @Get('charts/employees-by-status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  getEmployeesByStatus() {
    return this.service.getEmployeesByStatus();
  }

  @Get('charts/applicants-by-status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.RECRUITMENT)
  getApplicantsByStatus() {
    return this.service.getApplicantsByStatus();
  }

  @Get('charts/attendance-trend')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  getAttendanceTrend() {
    return this.service.getAttendanceTrend();
  }

  @Get('charts/payroll-summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.PAYROLL_ADMIN)
  getPayrollSummary() {
    return this.service.getPayrollSummary();
  }

  @Get('recent-hires')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  getRecentHires() {
    return this.service.getRecentHires();
  }

  @Get('upcoming-events')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  getUpcomingEvents() {
    return this.service.getUpcomingEvents();
  }

  // ─── New widgets (combined call) ────────────────────────────
  @Get('widgets')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  getWidgets() {
    return this.service.getWidgets();
  }
}

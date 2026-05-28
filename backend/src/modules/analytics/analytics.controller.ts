import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  @Get('overview')
  overview() { return this.svc.overview(); }

  @Get('headcount-trend')
  headcount() { return this.svc.headcountTrend(); }

  @Get('payroll-cost')
  payroll() { return this.svc.payrollCost(); }

  @Get('leave-usage')
  leave() { return this.svc.leaveUsage(); }

  @Get('attendance')
  attendance() { return this.svc.attendanceBreakdown(); }

  @Get('departments')
  dept() { return this.svc.departmentDistribution(); }

  @Get('applicant-funnel')
  funnel() { return this.svc.applicantFunnel(); }
}

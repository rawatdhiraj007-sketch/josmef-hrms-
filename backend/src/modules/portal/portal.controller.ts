import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PortalService } from './portal.service';

@Controller('portal')
@UseGuards(JwtAuthGuard)
export class PortalController {
  constructor(private readonly svc: PortalService) {}

  @Get('me')
  me(@Req() req: any) { return this.svc.getMe(req.user?.email); }

  @Get('leave/balances')
  myBalances(@Req() req: any, @Query('year') year?: string) {
    return this.svc.getMyLeaveBalances(req.user?.email, year ? Number(year) : undefined);
  }

  @Get('leave/requests')
  myRequests(@Req() req: any) { return this.svc.getMyLeaveRequests(req.user?.email); }

  @Post('leave/requests')
  createRequest(@Req() req: any, @Body() dto: { leaveTypeId: string; startDate: string; endDate: string; reason: string }) {
    return this.svc.createMyLeaveRequest(req.user?.email, dto);
  }

  @Get('payslips')
  myPayslips(@Req() req: any) { return this.svc.getMyPayslips(req.user?.email); }

  @Get('attendance')
  myAttendance(@Req() req: any, @Query('month') month?: string) {
    return this.svc.getMyAttendance(req.user?.email, month);
  }

  @Get('trainings')
  myTrainings(@Req() req: any) {
    return this.svc.getMyTrainings(req.user?.email);
  }
}

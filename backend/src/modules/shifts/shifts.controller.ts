import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';
import { ShiftsService } from './shifts.service';
import { ShiftAssignmentStatus, SwapRequestStatus } from './entities/shift.entity';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftsController {
  constructor(private readonly svc: ShiftsService) {}

  // ─── Templates ────────────────────────────────────────
  @Get('templates')
  listTemplates() { return this.svc.listTemplates(); }

  @Post('templates')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  createTemplate(@Body() dto: any) { return this.svc.createTemplate(dto); }

  @Put('templates/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  updateTemplate(@Param('id') id: string, @Body() dto: any) {
    return this.svc.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  deleteTemplate(@Param('id') id: string) { return this.svc.deleteTemplate(id); }

  // ─── Assignments ──────────────────────────────────────
  @Get()
  list(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('employeeId') employeeId?: string,
    @Query('department') department?: string,
  ) {
    return this.svc.list({ dateFrom, dateTo, employeeId, department });
  }

  @Get('today')
  today() { return this.svc.today(); }

  @Get('summary')
  summary(@Query('dateFrom') dateFrom: string, @Query('dateTo') dateTo: string) {
    return this.svc.summary(dateFrom, dateTo);
  }

  @Post('assign')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  assign(@Body() dto: any) { return this.svc.assign(dto); }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  updateStatus(@Param('id') id: string, @Body() body: { status: ShiftAssignmentStatus }) {
    return this.svc.updateStatus(id, body.status);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  remove(@Param('id') id: string) { return this.svc.remove(id); }

  // ─── Swaps ────────────────────────────────────────────
  @Get('swaps')
  listSwaps(@Query('status') status?: SwapRequestStatus) {
    return this.svc.listSwaps(status);
  }

  @Post('swaps')
  requestSwap(@Body() dto: any) { return this.svc.requestSwap(dto); }

  @Patch('swaps/:id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  approveSwap(@Param('id') id: string, @Req() req: any) {
    return this.svc.approveSwap(id, req.user?.sub);
  }

  @Patch('swaps/:id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  rejectSwap(@Param('id') id: string, @Req() req: any) {
    return this.svc.rejectSwap(id, req.user?.sub);
  }
}

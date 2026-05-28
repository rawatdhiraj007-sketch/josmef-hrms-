import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';
import { LeaveService } from './leave.service';
import {
  CreateLeaveTypeDto,
  UpdateLeaveTypeDto,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  SetBalanceDto,
} from './dto/leave.dto';
import { LeaveStatus } from './entities/leave-request.entity';

@Controller('leave')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly svc: LeaveService) {}

  // ─── Types ────────────────────────────────────────────
  @Get('types')
  listTypes() { return this.svc.listTypes(); }

  @Post('types')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  createType(@Body() dto: CreateLeaveTypeDto) { return this.svc.createType(dto); }

  @Put('types/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  updateType(@Param('id') id: string, @Body() dto: UpdateLeaveTypeDto) {
    return this.svc.updateType(id, dto);
  }

  // ─── Requests ─────────────────────────────────────────
  @Get('requests')
  listRequests(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: LeaveStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.listRequests({
      employeeId,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('requests/:id')
  findRequest(@Param('id') id: string) { return this.svc.findRequest(id); }

  @Post('requests')
  createRequest(@Body() dto: CreateLeaveRequestDto, @Req() req: any) {
    return this.svc.createRequest(dto, req.user?.sub);
  }

  @Patch('requests/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  updateRequest(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestDto,
    @Req() req: any,
  ) {
    return this.svc.updateRequest(id, dto, req.user?.sub);
  }

  // ─── Balances ─────────────────────────────────────────
  @Get('balances/:employeeId')
  getBalances(@Param('employeeId') employeeId: string, @Query('year') year?: string) {
    return this.svc.getEmployeeBalances(employeeId, year ? Number(year) : undefined);
  }

  @Put('balances')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  setBalance(@Body() dto: SetBalanceDto) { return this.svc.setBalance(dto); }

  // ─── Summary ──────────────────────────────────────────
  @Get('summary')
  summary() { return this.svc.summary(); }
}

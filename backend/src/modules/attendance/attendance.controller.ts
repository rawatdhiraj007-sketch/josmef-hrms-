import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  CreateAttendanceDto, ClockInDto, ClockOutDto,
  UpdateAttendanceDto, QueryAttendanceDto,
} from './dto/attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  create(@Body() dto: CreateAttendanceDto, @Request() req) {
    return this.service.create(dto, req.user.id);
  }

  @Post('clock-in')
  clockIn(@Body() dto: ClockInDto, @Request() req) {
    return this.service.clockIn(dto, req.user.id);
  }

  @Post('clock-out')
  clockOut(@Body() dto: ClockOutDto, @Request() req) {
    return this.service.clockOut(dto, req.user.id);
  }

  @Get()
  findAll(@Query() query: QueryAttendanceDto) {
    return this.service.findAll(query);
  }

  @Get('summary/:date')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  getDailySummary(@Param('date') date: string) {
    return this.service.getDailySummary(date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  update(@Param('id') id: string, @Body() dto: UpdateAttendanceDto, @Request() req) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}

import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';
import { LicensesService } from './licenses.service';
import { CreateLicenseDto, UpdateLicenseDto } from './dto/license.dto';
import { LicenseStatus, LicenseType } from './entities/license.entity';

@Controller('licenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LicensesController {
  constructor(private readonly svc: LicensesService) {}

  @Get()
  list(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: LicenseStatus,
    @Query('licenseType') licenseType?: LicenseType,
    @Query('countryCode') countryCode?: string,
    @Query('expiringWithinDays') expiringWithinDays?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.findAll({
      employeeId,
      status,
      licenseType,
      countryCode,
      expiringWithinDays: expiringWithinDays ? Number(expiringWithinDays) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('summary')
  summary() { return this.svc.summary(); }

  @Get('by-employee/:employeeId')
  byEmployee(@Param('employeeId') employeeId: string) {
    return this.svc.findByEmployee(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  create(@Body() dto: CreateLicenseDto) { return this.svc.create(dto); }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  update(@Param('id') id: string, @Body() dto: UpdateLicenseDto) {
    return this.svc.update(id, dto);
  }

  @Patch(':id/verify')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  verify(@Param('id') id: string) { return this.svc.verify(id); }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}

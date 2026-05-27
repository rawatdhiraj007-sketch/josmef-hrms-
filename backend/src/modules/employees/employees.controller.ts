import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { FormerEmployeesService } from '../former-employees/former-employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './dto/employee.dto';
import { ArchiveEmployeeDto } from '../former-employees/dto/former-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole, EmploymentStatus } from '@common/enums';
import { SeparationReason } from '../former-employees/entities/former-employee.entity';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(
    private readonly service: EmployeesService,
    private readonly formerEmployeesService: FormerEmployeesService,
  ) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  create(@Body() dto: CreateEmployeeDto, @Request() req) {
    return this.service.create(dto, req.user.id);
  }

  @Get()
  findAll(@Query() query: QueryEmployeeDto) {
    return this.service.findAll(query);
  }

  @Get('stats/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  getStatusStats() { return this.service.countByStatus(); }

  @Get('stats/department')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  getDeptStats() { return this.service.countByDepartment(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @Request() req) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(id); }

  /**
   * Archive employee → Former Employee
   * Marks the employee as separated and creates a FormerEmployee record
   */
  @Post(':id/archive')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  async archive(@Param('id') id: string, @Body() dto: ArchiveEmployeeDto, @Request() req) {
    const emp = await this.service.findOne(id);
    const dateSeparated = dto.dateSeparated || new Date().toISOString().split('T')[0];

    // Update employee status
    const statusMap: Record<SeparationReason, EmploymentStatus> = {
      [SeparationReason.RESIGNED]: EmploymentStatus.RESIGNED,
      [SeparationReason.TERMINATED]: EmploymentStatus.TERMINATED,
      [SeparationReason.END_OF_CONTRACT]: EmploymentStatus.END_OF_CONTRACT,
      [SeparationReason.RETIRED]: EmploymentStatus.RESIGNED,
      [SeparationReason.AWOL]: EmploymentStatus.AWOL,
      [SeparationReason.REDUNDANCY]: EmploymentStatus.RESIGNED,
      [SeparationReason.RETRENCHMENT]: EmploymentStatus.RESIGNED,
      [SeparationReason.DEATH]: EmploymentStatus.RESIGNED,
      [SeparationReason.OTHER]: EmploymentStatus.RESIGNED,
    };

    await this.service.update(id, {
      employmentStatus: statusMap[dto.separationReason],
      dateSeparated,
    }, req.user.id);

    // Create former employee record
    const formerEmployee = await this.formerEmployeesService.createFromEmployee({
      originalEmployeeId: emp.id,
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      middleName: emp.middleName,
      lastName: emp.lastName,
      suffix: emp.suffix,
      email: emp.email,
      mobile: emp.mobile,
      dateOfBirth: emp.dateOfBirth,
      gender: emp.gender,
      civilStatus: emp.civilStatus,
      sssNumber: emp.sssNumber,
      philhealthNumber: emp.philhealthNumber,
      pagibigNumber: emp.pagibigNumber,
      tinNumber: emp.tinNumber,
      position: emp.position,
      department: emp.department,
      branch: emp.branch,
      dateHired: emp.dateHired,
      dateSeparated: new Date(dateSeparated),
      separationReason: dto.separationReason,
      separationDetails: dto.separationDetails,
      lastSalary: emp.basicSalary,
      finalPay: dto.finalPay || 0,
      remarks: dto.remarks,
    }, req.user.id);

    return { employee: await this.service.findOne(id), formerEmployee };
  }
}

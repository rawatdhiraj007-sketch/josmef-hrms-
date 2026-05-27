import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { TraineesService } from './trainees.service';
import { CreateTraineeDto, UpdateTraineeDto, QueryTraineeDto } from './dto/trainee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';
import { EmployeesService } from '../employees/employees.service';

@Controller('trainees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TraineesController {
  constructor(
    private readonly service: TraineesService,
    private readonly employeesService: EmployeesService,
  ) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.RECRUITMENT)
  create(@Body() dto: CreateTraineeDto, @Request() req) {
    return this.service.create(dto, req.user.id);
  }

  @Post('from-applicant/:applicantId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.RECRUITMENT)
  createFromApplicant(
    @Param('applicantId') applicantId: string,
    @Body() dto: Partial<CreateTraineeDto>,
    @Request() req,
  ) {
    return this.service.createFromApplicant(applicantId, dto, req.user.id);
  }

  /**
   * Convert trainee to employee
   * Creates an Employee record from the trainee data
   */
  @Post(':id/promote')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  async promote(
    @Param('id') id: string,
    @Body() dto: Record<string, any>,
    @Request() req,
  ) {
    const trainee = await this.service.findOne(id);
    const employee = await this.employeesService.createFromTrainee({
      firstName: trainee.firstName,
      middleName: trainee.middleName,
      lastName: trainee.lastName,
      email: trainee.email,
      mobile: trainee.mobile,
      position: dto.position || trainee.positionApplied,
      department: dto.department || trainee.department,
      dateHired: dto.dateHired || new Date().toISOString().split('T')[0],
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      basicSalary: dto.basicSalary,
      dailyRate: dto.dailyRate,
      traineeId: trainee.id,
      applicantId: trainee.applicantId,
      ...dto,
    }, req.user.id);

    // Mark trainee as deployed
    await this.service.update(id, { status: 'deployed' as any, deploymentDate: dto.dateHired || new Date() }, req.user.id);

    return { trainee: await this.service.findOne(id), employee };
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.RECRUITMENT, UserRole.MANAGER)
  findAll(@Query() query: QueryTraineeDto) {
    return this.service.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  getStats() {
    return this.service.countByStatus();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  update(@Param('id') id: string, @Body() dto: UpdateTraineeDto, @Request() req) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

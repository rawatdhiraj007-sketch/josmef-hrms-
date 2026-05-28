import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';
import {
  TrainingService,
  CreateCourseDto,
  AssignDto,
  UpdateEnrollmentDto,
} from './training.service';
import { CourseCategory, EnrollmentStatus } from './entities/course.entity';

@Controller('training')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainingController {
  constructor(private readonly svc: TrainingService) {}

  // ─── Courses ─────────────────────────────────────────
  @Get('courses')
  listCourses(
    @Query('category') category?: CourseCategory,
    @Query('active') active?: string,
  ) {
    return this.svc.listCourses({
      category,
      isActive: active === undefined ? undefined : active === 'true',
    });
  }

  @Get('courses/:id')
  findCourse(@Param('id') id: string) { return this.svc.findCourse(id); }

  @Post('courses')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  createCourse(@Body() dto: CreateCourseDto) { return this.svc.createCourse(dto); }

  @Put('courses/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  updateCourse(@Param('id') id: string, @Body() dto: Partial<CreateCourseDto>) {
    return this.svc.updateCourse(id, dto);
  }

  @Delete('courses/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  deleteCourse(@Param('id') id: string) { return this.svc.deleteCourse(id); }

  // ─── Enrollments ─────────────────────────────────────
  @Post('assign')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  assign(@Body() dto: AssignDto) { return this.svc.assign(dto); }

  @Get('enrollments')
  listEnrollments(
    @Query('courseId') courseId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: EnrollmentStatus,
  ) {
    return this.svc.listEnrollments({ courseId, employeeId, status });
  }

  @Patch('enrollments/:id')
  updateEnrollment(@Param('id') id: string, @Body() dto: UpdateEnrollmentDto) {
    return this.svc.updateEnrollment(id, dto);
  }

  @Get('summary')
  summary() { return this.svc.summary(); }
}

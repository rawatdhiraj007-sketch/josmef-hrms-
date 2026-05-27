import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto, UpdateApplicantDto, QueryApplicantDto } from './dto/applicant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';

@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly service: ApplicantsService) {}

  /**
   * PUBLIC: Self-service applicant portal — no authentication required
   */
  @Post('public/apply')
  publicApply(@Body() dto: CreateApplicantDto) {
    return this.service.publicSubmit(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.RECRUITMENT)
  create(@Body() dto: CreateApplicantDto, @Request() req) {
    return this.service.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.RECRUITMENT, UserRole.MANAGER)
  findAll(@Query() query: QueryApplicantDto) {
    return this.service.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.RECRUITMENT)
  getStats() {
    return this.service.countByStatus();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.RECRUITMENT, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.RECRUITMENT)
  update(@Param('id') id: string, @Body() dto: UpdateApplicantDto, @Request() req) {
    return this.service.update(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

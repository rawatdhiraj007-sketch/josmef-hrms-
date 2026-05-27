import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import {
  ResumeParseDto, HrChatDto, EmployeeInsightDto,
  JobDescriptionDto, PerformanceReviewDto,
} from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('parse-resume')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.RECRUITMENT)
  parseResume(@Body() dto: ResumeParseDto) {
    return this.service.parseResume(dto);
  }

  @Post('chat')
  hrChat(@Body() dto: HrChatDto) {
    return this.service.hrChat(dto);
  }

  @Post('employee-insight')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  getEmployeeInsight(@Body() dto: EmployeeInsightDto) {
    return this.service.getEmployeeInsight(dto);
  }

  @Post('generate-jd')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.RECRUITMENT)
  generateJobDescription(@Body() dto: JobDescriptionDto) {
    return this.service.generateJobDescription(dto);
  }

  @Post('generate-review')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  generatePerformanceReview(@Body() dto: PerformanceReviewDto) {
    return this.service.generatePerformanceReview(dto);
  }
}

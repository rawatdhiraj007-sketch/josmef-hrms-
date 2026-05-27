import { Controller, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { FormerEmployeesService } from './former-employees.service';
import { QueryFormerEmployeeDto, UpdateFormerEmployeeDto } from './dto/former-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';

@Controller('former-employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FormerEmployeesController {
  constructor(private readonly service: FormerEmployeesService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  findAll(@Query() query: QueryFormerEmployeeDto) {
    return this.service.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  getStats() {
    return this.service.countByReason();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  update(@Param('id') id: string, @Body() dto: UpdateFormerEmployeeDto, @Request() req) {
    return this.service.update(id, dto, req.user.id);
  }
}

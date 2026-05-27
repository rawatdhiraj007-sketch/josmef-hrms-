import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { GeneratePayrollDto, UpdatePayrollDto, QueryPayrollDto } from './dto/payroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';

@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  @Post('generate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PAYROLL_ADMIN, UserRole.HR_ADMIN)
  generate(@Body() dto: GeneratePayrollDto, @Request() req) {
    return this.service.generate(dto, req.user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PAYROLL_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  findAll(@Query() query: QueryPayrollDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PAYROLL_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PAYROLL_ADMIN, UserRole.HR_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdatePayrollDto, @Request() req) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PAYROLL_ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}

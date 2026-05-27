import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ExitClearanceService } from './exit-clearance.service';
import {
  CreateExitClearanceDto, UpdateExitClearanceDto,
  ClearItemDto, QueryExitClearanceDto,
} from './dto/exit-clearance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';

@Controller('exit-clearance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExitClearanceController {
  constructor(private readonly service: ExitClearanceService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  create(@Body() dto: CreateExitClearanceDto, @Request() req) {
    return this.service.create(dto, req.user.id);
  }

  @Get()
  findAll(@Query() query: QueryExitClearanceDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  update(@Param('id') id: string, @Body() dto: UpdateExitClearanceDto, @Request() req) {
    return this.service.update(id, dto, req.user.id);
  }

  @Post('clear-item')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  clearItem(@Body() dto: ClearItemDto, @Request() req) {
    return this.service.clearItem(dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}

import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request, Patch,
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

  @Patch(':id/sign')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  sign(
    @Param('id') id: string,
    @Body() body: { signerType: 'employee' | 'hr'; signatureData: string; signerName?: string },
    @Request() req,
  ) {
    return this.service.sign(id, body.signerType, body.signatureData, body.signerName);
  }

  @Delete(':id/sign/:signerType')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  clearSignature(@Param('id') id: string, @Param('signerType') signerType: 'employee' | 'hr') {
    return this.service.clearSignature(id, signerType);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}

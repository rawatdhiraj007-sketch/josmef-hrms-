import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';
import { BonusService, CreateBonusRunDto, UpdateBonusItemDto } from './bonus.service';
import { BonusRunStatus } from './bonus-run.entity';

@Controller('bonus')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.PAYROLL_ADMIN)
export class BonusController {
  constructor(private readonly svc: BonusService) {}

  @Get() list() { return this.svc.list(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Post() create(@Body() dto: CreateBonusRunDto) { return this.svc.create(dto); }
  @Patch('items/:itemId') updateItem(@Param('itemId') id: string, @Body() dto: UpdateBonusItemDto) {
    return this.svc.updateItem(id, dto);
  }
  @Patch(':id/status') setStatus(@Param('id') id: string, @Body() body: { status: BonusRunStatus }) {
    return this.svc.setStatus(id, body.status);
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}

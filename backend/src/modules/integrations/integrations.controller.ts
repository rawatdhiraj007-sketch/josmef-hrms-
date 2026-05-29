import {
  Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
export class IntegrationsController {
  constructor(private readonly svc: IntegrationsService) {}

  // ─── Integrations ─────────────────────────────────────
  @Get() list() { return this.svc.listIntegrations(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findIntegration(id); }
  @Post() create(@Body() dto: any) { return this.svc.createIntegration(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.updateIntegration(id, dto);
  }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.deleteIntegration(id); }

  @Post(':id/test')
  testIntegration(@Param('id') id: string) { return this.svc.testIntegration(id); }
}

@Controller('automations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
export class AutomationsController {
  constructor(private readonly svc: IntegrationsService) {}

  @Get('rules') list() { return this.svc.listRules(); }
  @Get('rules/:id') findOne(@Param('id') id: string) { return this.svc.findRule(id); }
  @Post('rules') create(@Body() dto: any) { return this.svc.createRule(dto); }
  @Put('rules/:id') update(@Param('id') id: string, @Body() dto: any) {
    return this.svc.updateRule(id, dto);
  }
  @Patch('rules/:id/status')
  setStatus(@Param('id') id: string, @Body() body: { status: any }) {
    return this.svc.updateRule(id, { status: body.status });
  }
  @Delete('rules/:id') remove(@Param('id') id: string) { return this.svc.deleteRule(id); }

  @Get('runs') runs() { return this.svc.listRuns(); }
  @Get('event-types') eventTypes() { return this.svc.listEventTypes(); }
}

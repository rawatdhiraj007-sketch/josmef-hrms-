import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';
import { GovReportsService } from './gov-reports.service';
import { Response } from 'express';

@Controller('gov-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.PAYROLL_ADMIN)
export class GovReportsController {
  constructor(private readonly svc: GovReportsService) {}

  @Get('sss-r3')
  async sssR3(@Query('year') year: string, @Query('month') month: string, @Query('format') format?: string, @Res() res?: Response) {
    const data = await this.svc.sssR3(Number(year), Number(month));
    return this.respond(data, format, `sss-r3-${year}-${month}`, res);
  }

  @Get('philhealth-rf1')
  async philhealth(@Query('year') year: string, @Query('month') month: string, @Query('format') format?: string, @Res() res?: Response) {
    const data = await this.svc.philhealthRF1(Number(year), Number(month));
    return this.respond(data, format, `philhealth-rf1-${year}-${month}`, res);
  }

  @Get('pagibig-mcrf')
  async pagibig(@Query('year') year: string, @Query('month') month: string, @Query('format') format?: string, @Res() res?: Response) {
    const data = await this.svc.pagibigMCRF(Number(year), Number(month));
    return this.respond(data, format, `pagibig-mcrf-${year}-${month}`, res);
  }

  @Get('bir-2316')
  async bir2316(@Query('year') year: string, @Query('format') format?: string, @Res() res?: Response) {
    const data = await this.svc.bir2316(Number(year));
    return this.respond(data, format, `bir-2316-${year}`, res);
  }

  @Get('bir-alphalist')
  async alphalist(@Query('year') year: string, @Query('format') format?: string, @Res() res?: Response) {
    const data = await this.svc.birAlphalist(Number(year));
    return this.respond(data, format, `bir-alphalist-${year}`, res);
  }

  private respond(data: any, format: string | undefined, filename: string, res?: Response) {
    if (format === 'csv' && res) {
      const csv = this.svc.toCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    }
    if (res) return res.json(data);
    return data;
  }
}

import { Module } from '@nestjs/common';
import { GovReportsService } from './gov-reports.service';
import { GovReportsController } from './gov-reports.controller';

@Module({
  controllers: [GovReportsController],
  providers: [GovReportsService],
  exports: [GovReportsService],
})
export class GovReportsModule {}

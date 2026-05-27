import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentReport } from './entities/incident-report.entity';
import { IncidentReportsService } from './incident-reports.service';
import { IncidentReportsController } from './incident-reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IncidentReport])],
  controllers: [IncidentReportsController],
  providers: [IncidentReportsService],
  exports: [IncidentReportsService],
})
export class IncidentReportsModule {}

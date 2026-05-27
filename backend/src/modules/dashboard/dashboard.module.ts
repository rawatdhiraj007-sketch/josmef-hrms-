import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Employee } from '../employees/entities/employee.entity';
import { Applicant } from '../applicants/entities/applicant.entity';
import { Trainee } from '../trainees/entities/trainee.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Payroll } from '../payroll/entities/payroll.entity';
import { ExitClearance } from '../exit-clearance/entities/exit-clearance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Applicant, Trainee, Attendance, Payroll, ExitClearance])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

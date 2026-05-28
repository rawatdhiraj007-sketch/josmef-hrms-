import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payroll } from './entities/payroll.entity';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { Employee } from '../employees/entities/employee.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { BonusRun, BonusItem } from './bonus/bonus-run.entity';
import { BonusService } from './bonus/bonus.service';
import { BonusController } from './bonus/bonus.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payroll, Employee, Attendance, BonusRun, BonusItem])],
  controllers: [PayrollController, BonusController],
  providers: [PayrollService, BonusService],
  exports: [PayrollService, BonusService],
})
export class PayrollModule {}

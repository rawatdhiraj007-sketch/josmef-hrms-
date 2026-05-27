import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Employee } from '../employees/entities/employee.entity';
import { Attendance } from '../attendance/entities/attendance.entity';
import { Payroll } from '../payroll/entities/payroll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Attendance, Payroll])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { FormerEmployeesModule } from '../former-employees/former-employees.module';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), FormerEmployeesModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}

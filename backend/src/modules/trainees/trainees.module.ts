import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainee } from './entities/trainee.entity';
import { TraineesService } from './trainees.service';
import { TraineesController } from './trainees.controller';
import { ApplicantsModule } from '../applicants/applicants.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trainee]), ApplicantsModule, EmployeesModule],
  controllers: [TraineesController],
  providers: [TraineesService],
  exports: [TraineesService],
})
export class TraineesModule {}

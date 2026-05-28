import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExitClearance, ClearanceItem } from './entities/exit-clearance.entity';
import { ExitClearanceService } from './exit-clearance.service';
import { ExitClearanceController } from './exit-clearance.controller';
import { Employee } from '../employees/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExitClearance, ClearanceItem, Employee])],
  controllers: [ExitClearanceController],
  providers: [ExitClearanceService],
  exports: [ExitClearanceService],
})
export class ExitClearanceModule {}

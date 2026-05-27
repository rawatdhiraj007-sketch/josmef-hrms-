import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExitClearance, ClearanceItem } from './entities/exit-clearance.entity';
import { ExitClearanceService } from './exit-clearance.service';
import { ExitClearanceController } from './exit-clearance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExitClearance, ClearanceItem])],
  controllers: [ExitClearanceController],
  providers: [ExitClearanceService],
  exports: [ExitClearanceService],
})
export class ExitClearanceModule {}

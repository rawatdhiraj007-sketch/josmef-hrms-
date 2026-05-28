import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { LeaveModule } from '../leave/leave.module';
import { TrainingModule } from '../training/training.module';

@Module({
  imports: [LeaveModule, TrainingModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}

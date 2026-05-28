import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { LeaveModule } from '../leave/leave.module';

@Module({
  imports: [LeaveModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}

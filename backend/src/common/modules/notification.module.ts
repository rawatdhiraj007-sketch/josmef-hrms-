import { Global, Module } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';

@Global()
@Module({
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

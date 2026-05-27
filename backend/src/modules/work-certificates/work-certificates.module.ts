import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkCertificate } from './entities/work-certificate.entity';
import { WorkCertificatesService } from './work-certificates.service';
import { WorkCertificatesController } from './work-certificates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkCertificate])],
  controllers: [WorkCertificatesController],
  providers: [WorkCertificatesService],
  exports: [WorkCertificatesService],
})
export class WorkCertificatesModule {}

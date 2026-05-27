import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Applicant } from './entities/applicant.entity';
import { ApplicantsService } from './applicants.service';
import { ApplicantsController } from './applicants.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Applicant])],
  controllers: [ApplicantsController],
  providers: [ApplicantsService],
  exports: [ApplicantsService],
})
export class ApplicantsModule {}

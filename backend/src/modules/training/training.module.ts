import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, CourseEnrollment } from './entities/course.entity';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { GraphyClient } from './graphy/graphy.client';
import { GraphyController } from './graphy/graphy.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseEnrollment])],
  controllers: [TrainingController, GraphyController],
  providers: [TrainingService, GraphyClient],
  exports: [TrainingService],
})
export class TrainingModule {}

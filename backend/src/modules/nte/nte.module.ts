import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NteRecord } from './entities/nte.entity';
import { NteService } from './nte.service';
import { NteController } from './nte.controller';
import { Employee } from '../employees/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NteRecord, Employee])],
  controllers: [NteController],
  providers: [NteService],
  exports: [NteService],
})
export class NteModule {}

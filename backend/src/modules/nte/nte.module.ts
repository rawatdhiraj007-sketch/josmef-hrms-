import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NteRecord } from './entities/nte.entity';
import { NteService } from './nte.service';
import { NteController } from './nte.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NteRecord])],
  controllers: [NteController],
  providers: [NteService],
  exports: [NteService],
})
export class NteModule {}

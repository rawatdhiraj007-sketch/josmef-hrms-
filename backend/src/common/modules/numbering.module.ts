import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Counter } from '../entities/counter.entity';
import { NumberingService } from '../services/numbering.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Counter])],
  providers: [NumberingService],
  exports: [NumberingService],
})
export class NumberingModule {}

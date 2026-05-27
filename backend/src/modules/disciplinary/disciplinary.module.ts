import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisciplinaryAction } from './entities/disciplinary.entity';
import { DisciplinaryService } from './disciplinary.service';
import { DisciplinaryController } from './disciplinary.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DisciplinaryAction])],
  controllers: [DisciplinaryController],
  providers: [DisciplinaryService],
  exports: [DisciplinaryService],
})
export class DisciplinaryModule {}

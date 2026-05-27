import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormerEmployee } from './entities/former-employee.entity';
import { FormerEmployeesService } from './former-employees.service';
import { FormerEmployeesController } from './former-employees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FormerEmployee])],
  controllers: [FormerEmployeesController],
  providers: [FormerEmployeesService],
  exports: [FormerEmployeesService],
})
export class FormerEmployeesModule {}

import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { NteService } from './nte.service';
import { CreateNteDto, UpdateNteDto, QueryNteDto } from './dto/nte.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';

@Controller('nte')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NteController {
  constructor(private readonly service: NteService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  create(@Body() dto: CreateNteDto, @Request() req) {
    return this.service.create(dto, req.user.id);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF, UserRole.MANAGER)
  findAll(@Query() query: QueryNteDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  update(@Param('id') id: string, @Body() dto: UpdateNteDto, @Request() req) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

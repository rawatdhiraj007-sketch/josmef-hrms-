import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  create(@Body() dto: CreateDocumentDto, @Request() req) {
    return this.service.create(dto, req.user.id);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string, @Query('category') category?: string) {
    return this.service.findByEmployee(employeeId, category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @Request() req) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import {
  CreateAttendanceDto, ClockInDto, ClockOutDto,
  UpdateAttendanceDto, QueryAttendanceDto,
} from './dto/attendance.dto';
import { AttendanceType } from '@common/enums';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly repo: Repository<Attendance>,
  ) {}

  async create(dto: CreateAttendanceDto, userId: string): Promise<Attendance> {
    const rec = this.repo.create({ ...dto, createdBy: userId });
    return this.repo.save(rec);
  }

  async clockIn(dto: ClockInDto, userId: string): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.repo.findOne({
      where: { employeeId: dto.employeeId, date: today as any },
    });
    if (existing && existing.timeIn) {
      throw new BadRequestException('Already clocked in today');
    }

    const now = new Date();
    const timeIn = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Calculate late (assuming 8:00 AM standard)
    const standardStart = 8 * 60; // 480 min
    const actualStart = now.getHours() * 60 + now.getMinutes();
    const lateMinutes = Math.max(0, actualStart - standardStart);

    const rec = this.repo.create({
      employeeId: dto.employeeId,
      date: today,
      timeIn,
      status: lateMinutes > 0 ? AttendanceType.LATE : AttendanceType.PRESENT,
      lateMinutes,
      latitudeIn: dto.latitudeIn,
      longitudeIn: dto.longitudeIn,
      source: dto.source || 'manual',
      rfidTag: dto.rfidTag,
      location: dto.location,
      createdBy: userId,
    });
    return this.repo.save(rec);
  }

  async clockOut(dto: ClockOutDto, userId: string): Promise<Attendance> {
    const rec = await this.repo.findOne({ where: { id: dto.attendanceId } });
    if (!rec) throw new NotFoundException('Attendance record not found');
    if (rec.timeOut) throw new BadRequestException('Already clocked out');

    const now = new Date();
    const timeOut = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Calculate hours worked
    const [inH, inM] = rec.timeIn.split(':').map(Number);
    const inMinutes = inH * 60 + inM;
    const outMinutes = now.getHours() * 60 + now.getMinutes();
    let worked = (outMinutes - inMinutes) / 60;

    // Deduct 1hr break if worked > 5hrs
    if (worked > 5) worked -= 1;
    worked = Math.max(0, Math.round(worked * 100) / 100);

    const overtime = Math.max(0, Math.round((worked - 8) * 100) / 100);
    const undertime = worked < 8 ? Math.round((8 - worked) * 60 * 100) / 100 : 0;

    rec.timeOut = timeOut;
    rec.hoursWorked = worked;
    rec.overtimeHours = overtime;
    rec.undertimeMinutes = undertime;
    if (dto.latitudeOut !== undefined) rec.latitudeOut = dto.latitudeOut;
    if (dto.longitudeOut !== undefined) rec.longitudeOut = dto.longitudeOut;
    rec.updatedBy = userId;

    return this.repo.save(rec);
  }

  async findAll(query: QueryAttendanceDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('a')
      .leftJoinAndSelect('a.employee', 'e')
      .where('a.deleted_at IS NULL');

    if (query.employeeId) qb.andWhere('a.employeeId = :eid', { eid: query.employeeId });
    if (query.dateFrom) qb.andWhere('a.date >= :df', { df: query.dateFrom });
    if (query.dateTo) qb.andWhere('a.date <= :dt', { dt: query.dateTo });
    if (query.status) qb.andWhere('a.status = :st', { st: query.status });
    if (query.department) qb.andWhere('e.department = :dep', { dep: query.department });

    qb.orderBy('a.date', 'DESC').addOrderBy('e.lastName', 'ASC')
      .skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<Attendance> {
    const rec = await this.repo.findOne({ where: { id }, relations: ['employee'] });
    if (!rec) throw new NotFoundException('Record not found');
    return rec;
  }

  async update(id: string, dto: UpdateAttendanceDto, userId: string): Promise<Attendance> {
    const rec = await this.findOne(id);
    Object.assign(rec, dto, { updatedBy: userId });
    return this.repo.save(rec);
  }

  async remove(id: string): Promise<void> {
    const rec = await this.findOne(id);
    await this.repo.softRemove(rec);
  }

  async getDailySummary(date: string) {
    return this.repo.createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('a.date = :d AND a.deleted_at IS NULL', { d: date })
      .groupBy('a.status')
      .getRawMany();
  }
}

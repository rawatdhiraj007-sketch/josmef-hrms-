import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Course,
  CourseEnrollment,
  EnrollmentStatus,
  CourseProvider,
  CourseCategory,
} from './entities/course.entity';

export interface CreateCourseDto {
  title: string;
  description?: string;
  provider?: CourseProvider;
  category?: CourseCategory;
  url?: string;
  externalId?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  isMandatory?: boolean;
  issuesCertificate?: boolean;
  skills?: string[];
}

export interface AssignDto {
  courseId: string;
  employeeIds: string[];
  dueDate?: string;
}

export interface UpdateEnrollmentDto {
  status?: EnrollmentStatus;
  progressPercent?: number;
  score?: number;
  certificateUrl?: string;
}

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(CourseEnrollment)
    private readonly enrollRepo: Repository<CourseEnrollment>,
  ) {}

  // ─── Courses ─────────────────────────────────────────
  listCourses(opts: { category?: CourseCategory; isActive?: boolean }) {
    const where: any = {};
    if (opts.category) where.category = opts.category;
    if (opts.isActive !== undefined) where.isActive = opts.isActive;
    return this.courseRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  findCourse(id: string) {
    return this.courseRepo.findOne({ where: { id } });
  }

  createCourse(dto: CreateCourseDto) {
    return this.courseRepo.save(this.courseRepo.create(dto));
  }

  async updateCourse(id: string, dto: Partial<CreateCourseDto>) {
    const c = await this.courseRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Course not found');
    Object.assign(c, dto);
    return this.courseRepo.save(c);
  }

  async deleteCourse(id: string) {
    const c = await this.courseRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Course not found');
    c.isActive = false;
    await this.courseRepo.save(c);
    return { ok: true };
  }

  // ─── Enrollments ─────────────────────────────────────
  async assign(dto: AssignDto) {
    const course = await this.courseRepo.findOne({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (!dto.employeeIds?.length) throw new BadRequestException('Select at least one employee');

    // Skip already-assigned employees
    const existing = await this.enrollRepo.find({
      where: { courseId: dto.courseId, employeeId: In(dto.employeeIds) },
    });
    const existingIds = new Set(existing.map((e) => e.employeeId));
    const toCreate = dto.employeeIds.filter((id) => !existingIds.has(id));

    const enrollments: CourseEnrollment[] = toCreate.map((employeeId) =>
      this.enrollRepo.create({
        courseId: dto.courseId,
        employeeId,
        status: EnrollmentStatus.ASSIGNED,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      } as any) as unknown as CourseEnrollment,
    );
    if (enrollments.length) await this.enrollRepo.save(enrollments);

    return {
      assigned: enrollments.length,
      alreadyEnrolled: existingIds.size,
      total: dto.employeeIds.length,
    };
  }

  listEnrollments(opts: { courseId?: string; employeeId?: string; status?: EnrollmentStatus }) {
    const where: any = {};
    if (opts.courseId) where.courseId = opts.courseId;
    if (opts.employeeId) where.employeeId = opts.employeeId;
    if (opts.status) where.status = opts.status;
    return this.enrollRepo.find({
      where,
      relations: ['course', 'employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateEnrollment(id: string, dto: UpdateEnrollmentDto) {
    const e = await this.enrollRepo.findOne({ where: { id }, relations: ['course'] });
    if (!e) throw new NotFoundException('Enrollment not found');

    if (dto.status === EnrollmentStatus.IN_PROGRESS && !e.startedAt) {
      e.startedAt = new Date();
    }
    if (dto.status === EnrollmentStatus.COMPLETED && !e.completedAt) {
      e.completedAt = new Date();
      e.progressPercent = 100;
      if (e.course?.issuesCertificate && !e.certificateNumber) {
        e.certificateNumber = `CERT-${Date.now().toString().slice(-9)}`;
      }
    }
    if (dto.status !== undefined) e.status = dto.status;
    if (dto.progressPercent !== undefined) e.progressPercent = dto.progressPercent;
    if (dto.score !== undefined) e.score = dto.score;
    if (dto.certificateUrl !== undefined) e.certificateUrl = dto.certificateUrl;

    return this.enrollRepo.save(e);
  }

  // ─── Stats ───────────────────────────────────────────
  async summary() {
    const totalCourses = await this.courseRepo.count({ where: { isActive: true } });
    const totalEnrollments = await this.enrollRepo.count();
    const assigned = await this.enrollRepo.count({ where: { status: EnrollmentStatus.ASSIGNED } });
    const inProgress = await this.enrollRepo.count({ where: { status: EnrollmentStatus.IN_PROGRESS } });
    const completed = await this.enrollRepo.count({ where: { status: EnrollmentStatus.COMPLETED } });
    return { totalCourses, totalEnrollments, assigned, inProgress, completed };
  }

  // ─── For portal ──────────────────────────────────────
  async getEmployeeEnrollments(employeeId: string) {
    return this.enrollRepo.find({
      where: { employeeId },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
  }
}

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
import { GraphyClient } from './graphy/graphy.client';

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
    private readonly graphy: GraphyClient,
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

  // ─── Graphy integration ──────────────────────────────
  /**
   * Sync a single enrollment's progress from Graphy.
   * Only acts on enrollments whose course is provider=GRAPHY with externalId set.
   */
  async syncEnrollmentFromGraphy(enrollmentId: string): Promise<{
    ok: boolean;
    synced: boolean;
    reason?: string;
    enrollment?: CourseEnrollment;
  }> {
    const enr = await this.enrollRepo.findOne({
      where: { id: enrollmentId },
      relations: ['course', 'employee'],
    });
    if (!enr) return { ok: false, synced: false, reason: 'enrollment not found' };
    if (enr.course.provider !== CourseProvider.GRAPHY) {
      return { ok: false, synced: false, reason: 'course is not a Graphy course' };
    }
    if (!enr.course.externalId) {
      return { ok: false, synced: false, reason: 'course missing Graphy externalId' };
    }
    if (!this.graphy.enabled()) {
      return { ok: false, synced: false, reason: 'Graphy API not configured (GRAPHY_API_KEY)' };
    }

    const progress = await this.graphy.getLearnerProgress(
      enr.employee.email,
      enr.course.externalId,
    );
    if (!progress) {
      return { ok: false, synced: false, reason: 'Graphy returned no data' };
    }

    enr.progressPercent = progress.progressPercent;
    if (progress.score !== undefined) enr.score = progress.score;
    if (progress.certificateUrl) enr.certificateUrl = progress.certificateUrl;

    if (progress.status === 'completed') {
      enr.status = EnrollmentStatus.COMPLETED;
      enr.completedAt = progress.completedAt
        ? new Date(progress.completedAt)
        : new Date();
      enr.progressPercent = 100;
      if (enr.course.issuesCertificate && !enr.certificateNumber) {
        enr.certificateNumber = `CERT-${Date.now().toString().slice(-9)}`;
      }
    } else if (progress.status === 'in_progress') {
      enr.status = EnrollmentStatus.IN_PROGRESS;
      if (!enr.startedAt) enr.startedAt = new Date();
    }

    await this.enrollRepo.save(enr);
    return { ok: true, synced: true, enrollment: enr };
  }

  /** Sync all enrollments for a course. Returns counts. */
  async syncCourseFromGraphy(courseId: string): Promise<{
    total: number;
    synced: number;
    skipped: number;
    errors: number;
  }> {
    const enrollments = await this.enrollRepo.find({
      where: { courseId, status: In([EnrollmentStatus.ASSIGNED, EnrollmentStatus.IN_PROGRESS]) },
      relations: ['course', 'employee'],
    });
    let synced = 0, skipped = 0, errors = 0;
    for (const enr of enrollments) {
      try {
        const r = await this.syncEnrollmentFromGraphy(enr.id);
        if (r.synced) synced++;
        else if (r.reason?.includes('not configured')) {
          // Hard stop — no point retrying
          errors++;
          break;
        } else skipped++;
      } catch {
        errors++;
      }
    }
    return { total: enrollments.length, synced, skipped, errors };
  }

  /**
   * Handle a webhook event from Graphy. Called after signature is verified.
   * Supports: enrollment.completed, enrollment.progress
   */
  async handleGraphyWebhook(event: {
    type: string;
    data: {
      learnerEmail?: string;
      email?: string;
      courseId?: string;
      progress?: number;
      progressPercent?: number;
      score?: number;
      completedAt?: string;
      certificateUrl?: string;
    };
  }): Promise<{ matched: boolean; updated?: boolean }> {
    const learnerEmail = event.data.learnerEmail ?? event.data.email;
    const courseExternalId = event.data.courseId;
    if (!learnerEmail || !courseExternalId) return { matched: false };

    // Find matching enrollment
    const course = await this.courseRepo.findOne({
      where: { externalId: courseExternalId, provider: CourseProvider.GRAPHY },
    });
    if (!course) return { matched: false };

    const enrollment = await this.enrollRepo
      .createQueryBuilder('e')
      .innerJoinAndSelect('e.employee', 'emp')
      .innerJoinAndSelect('e.course', 'c')
      .where('c.id = :cid', { cid: course.id })
      .andWhere('emp.email = :email', { email: learnerEmail })
      .getOne();
    if (!enrollment) return { matched: false };

    const pct = event.data.progressPercent ?? event.data.progress ?? 0;
    enrollment.progressPercent = Number(pct);
    if (event.data.score !== undefined) enrollment.score = Number(event.data.score);
    if (event.data.certificateUrl) enrollment.certificateUrl = event.data.certificateUrl;

    if (event.type === 'enrollment.completed' || pct >= 100) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = event.data.completedAt
        ? new Date(event.data.completedAt)
        : new Date();
      enrollment.progressPercent = 100;
      if (course.issuesCertificate && !enrollment.certificateNumber) {
        enrollment.certificateNumber = `CERT-${Date.now().toString().slice(-9)}`;
      }
    } else if (pct > 0) {
      enrollment.status = EnrollmentStatus.IN_PROGRESS;
      if (!enrollment.startedAt) enrollment.startedAt = new Date();
    }

    await this.enrollRepo.save(enrollment);
    return { matched: true, updated: true };
  }
}

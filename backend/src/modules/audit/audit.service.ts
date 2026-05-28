import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

export interface LogParams {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  module: string;
  resourceId?: string;
  summary?: string;
  method?: string;
  path?: string;
  ipAddress?: string;
  userAgent?: string;
  before?: any;
  after?: any;
  statusCode?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(p: LogParams): Promise<void> {
    try {
      await this.repo.save(this.repo.create(p));
    } catch {
      // never let audit write failures break a request
    }
  }

  async findAll(opts: {
    page?: number;
    limit?: number;
    action?: AuditAction;
    module?: string;
    userId?: string;
    from?: string;
    to?: string;
  }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(200, opts.limit ?? 50);
    const where: FindOptionsWhere<AuditLog> = {};
    if (opts.action) where.action = opts.action;
    if (opts.module) where.module = opts.module;
    if (opts.userId) where.userId = opts.userId;
    if (opts.from && opts.to) {
      where.createdAt = Between(new Date(opts.from), new Date(opts.to)) as any;
    }
    const [rows, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { rows, total, page, limit };
  }
}

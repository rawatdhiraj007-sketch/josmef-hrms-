import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';
import { AuditAction } from './entities/audit-log.entity';

const METHOD_TO_ACTION: Record<string, AuditAction | null> = {
  POST: AuditAction.CREATE,
  PUT: AuditAction.UPDATE,
  PATCH: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
  GET: null, // we don't log reads
};

// Skip noisy/non-mutating paths
const SKIP_PATTERNS = [
  /^\/api\/v1\/healthz/,
  /^\/healthz/,
  /^\/debug/,
  /^\/api\/v1\/audit/,
  /^\/api\/v1\/dashboard/,
  /^\/api\/v1\/compliance/,
];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const res = ctx.switchToHttp().getResponse();
    const method = req.method as string;
    const path = req.originalUrl || req.url || '';

    const action = METHOD_TO_ACTION[method];
    if (!action) return next.handle();
    if (SKIP_PATTERNS.some((p) => p.test(path))) return next.handle();

    return next.handle().pipe(
      tap({
        next: (data) => {
          this.write(req, res, action, path, method, data, null);
        },
        error: (err) => {
          this.write(req, res, action, path, method, null, err);
        },
      }),
    );
  }

  private write(
    req: any,
    res: any,
    action: AuditAction,
    path: string,
    method: string,
    data: any,
    err: any,
  ) {
    const user = req.user || {};
    const module = this.extractModule(path);
    const resourceId =
      data?.id ?? req.params?.id ?? data?.data?.id ?? undefined;
    const summary = err
      ? `${method} ${path} → ${err?.status ?? 500}`
      : `${method} ${path}`;

    this.audit.log({
      userId: user.sub || user.id,
      userEmail: user.email,
      userRole: user.role,
      action,
      module,
      resourceId,
      summary,
      method,
      path,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || undefined,
      userAgent: req.headers?.['user-agent']?.slice(0, 500),
      after: this.sanitize(data),
      statusCode: err ? err?.status ?? 500 : res.statusCode,
    });
  }

  private extractModule(path: string): string {
    // /api/v1/<module>/...
    const m = path.match(/\/api\/v1\/([^/?]+)/);
    return m ? m[1] : 'unknown';
  }

  private sanitize(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const SENSITIVE = ['password', 'token', 'access_token', 'refresh_token', 'jwt'];
    try {
      const clone = JSON.parse(JSON.stringify(data));
      const scrub = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const k of Object.keys(obj)) {
          if (SENSITIVE.includes(k.toLowerCase())) {
            obj[k] = '[REDACTED]';
          } else if (typeof obj[k] === 'object') {
            scrub(obj[k]);
          }
        }
      };
      scrub(clone);
      return clone;
    } catch {
      return undefined;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Graphy.com REST API client.
 *
 * Configuration (env vars):
 *   GRAPHY_BASE_URL     — e.g. https://api.ongraphy.com  (or your custom domain)
 *   GRAPHY_API_KEY      — Graphy API key from school admin
 *   GRAPHY_MID          — Merchant ID (some endpoints require it)
 *   GRAPHY_WEBHOOK_SECRET — secret for verifying webhook signatures
 *
 * If GRAPHY_API_KEY is missing, the client logs a warning and `enabled()`
 * returns false. All callers should branch on that to avoid runtime failures.
 *
 * Endpoint shapes follow Graphy's standard learner & course API:
 *   GET  /public/v1/learner/{email}/course/{courseId}/progress
 *   POST /public/v1/sso/url   (single-sign-on URL generation)
 * If your school exposes different paths, change the URLs in the methods
 * below — every endpoint is a one-line change.
 */
@Injectable()
export class GraphyClient {
  private readonly logger = new Logger(GraphyClient.name);

  enabled(): boolean {
    return !!process.env.GRAPHY_API_KEY;
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GRAPHY_API_KEY}`,
      'x-api-key': process.env.GRAPHY_API_KEY ?? '',
    };
  }

  private baseUrl(): string {
    return process.env.GRAPHY_BASE_URL ?? 'https://api.ongraphy.com';
  }

  /**
   * Get a learner's progress on a course.
   * Returns: { progressPercent, status, completedAt, score, certificateUrl }
   */
  async getLearnerProgress(
    learnerEmail: string,
    courseId: string,
  ): Promise<{
    progressPercent: number;
    status: 'not_started' | 'in_progress' | 'completed';
    completedAt?: string;
    score?: number;
    certificateUrl?: string;
  } | null> {
    if (!this.enabled()) {
      this.logger.warn('Graphy not configured — set GRAPHY_API_KEY to enable');
      return null;
    }
    const url = `${this.baseUrl()}/public/v1/learner/${encodeURIComponent(learnerEmail)}/course/${encodeURIComponent(courseId)}/progress`;
    try {
      const res = await fetch(url, { headers: this.headers() });
      if (!res.ok) {
        this.logger.warn(`Graphy progress fetch ${res.status} for ${learnerEmail}/${courseId}`);
        return null;
      }
      const json: any = await res.json();
      // Map Graphy's response into our normalized shape. Adjust field names if
      // your school's API contract differs.
      return {
        progressPercent: Number(json?.progress ?? json?.progressPercent ?? 0),
        status:
          json?.status === 'completed'
            ? 'completed'
            : (json?.progress ?? 0) > 0
              ? 'in_progress'
              : 'not_started',
        completedAt: json?.completedAt ?? json?.completed_at ?? undefined,
        score: json?.score !== undefined ? Number(json.score) : undefined,
        certificateUrl: json?.certificateUrl ?? json?.certificate_url ?? undefined,
      };
    } catch (err: any) {
      this.logger.error(`Graphy API error: ${err?.message}`);
      return null;
    }
  }

  /**
   * Generate an SSO URL to launch a course as a specific learner.
   * Returns a URL that, when opened, logs the user in to Graphy and lands
   * them on the course — no separate login.
   */
  async ssoLaunchUrl(
    learnerEmail: string,
    learnerName: string,
    courseId: string,
  ): Promise<string | null> {
    if (!this.enabled()) return null;
    try {
      const res = await fetch(`${this.baseUrl()}/public/v1/sso/url`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          email: learnerEmail,
          name: learnerName,
          courseId,
        }),
      });
      if (!res.ok) return null;
      const json: any = await res.json();
      return json?.url ?? json?.ssoUrl ?? null;
    } catch (err: any) {
      this.logger.error(`Graphy SSO error: ${err?.message}`);
      return null;
    }
  }

  /**
   * Verify HMAC signature on an incoming webhook from Graphy.
   * Graphy sends `x-graphy-signature: sha256=<hex>` header (HMAC of raw body
   * using GRAPHY_WEBHOOK_SECRET).
   */
  verifyWebhookSignature(rawBody: string, signature: string | undefined): boolean {
    const secret = process.env.GRAPHY_WEBHOOK_SECRET;
    if (!secret) {
      // If no secret configured, allow webhook in development but warn
      this.logger.warn(
        'GRAPHY_WEBHOOK_SECRET not set — accepting webhook without verification',
      );
      return true;
    }
    if (!signature) return false;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    const provided = signature.replace(/^sha256=/, '');
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(provided, 'hex'),
      );
    } catch {
      return false;
    }
  }
}

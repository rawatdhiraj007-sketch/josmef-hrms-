import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  UseGuards,
  Param,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/enums';
import { TrainingService } from '../training.service';
import { GraphyClient } from './graphy.client';
import type { Request } from 'express';

@Controller('training/graphy')
export class GraphyController {
  private readonly logger = new Logger(GraphyController.name);

  constructor(
    private readonly training: TrainingService,
    private readonly graphy: GraphyClient,
  ) {}

  /**
   * Public webhook receiver for Graphy events.
   * In Graphy admin, configure webhook URL to:
   *   https://<your-api>/api/v1/training/graphy/webhook
   * Set GRAPHY_WEBHOOK_SECRET env var to the same secret you set in Graphy.
   */
  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: Request,
    @Headers('x-graphy-signature') signature: string,
    @Body() event: any,
  ) {
    const rawBody = (req as any).rawBody?.toString?.() ?? JSON.stringify(event);
    if (!this.graphy.verifyWebhookSignature(rawBody, signature)) {
      this.logger.warn('Rejected Graphy webhook — invalid signature');
      throw new BadRequestException('Invalid signature');
    }
    this.logger.log(`Graphy webhook event: ${event?.type}`);
    const result = await this.training.handleGraphyWebhook(event);
    return { ok: true, ...result };
  }

  /**
   * Admin-triggered sync of a single enrollment.
   */
  @Post('sync/enrollment/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  syncEnrollment(@Param('id') id: string) {
    return this.training.syncEnrollmentFromGraphy(id);
  }

  /**
   * Admin-triggered sync of an entire course (all active enrollments).
   */
  @Post('sync/course/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  syncCourse(@Param('id') id: string) {
    return this.training.syncCourseFromGraphy(id);
  }

  /**
   * Returns API connection status — useful for the admin UI to show
   * whether Graphy is configured.
   */
  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_ADMIN, UserRole.HR_STAFF)
  status() {
    return {
      configured: this.graphy.enabled(),
      baseUrl: process.env.GRAPHY_BASE_URL ?? 'https://api.ongraphy.com',
      webhookSecretSet: !!process.env.GRAPHY_WEBHOOK_SECRET,
    };
  }
}

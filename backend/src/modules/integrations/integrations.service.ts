import { Injectable, Logger, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  Integration,
  AutomationRule,
  AutomationRun,
  ChannelType,
  EventType,
  RuleStatus,
} from './entities/integration.entity';
import { ChannelDeliveryPayload } from './channels/channel.interface';
import { SlackChannel } from './channels/slack.channel';
import { TeamsChannel } from './channels/teams.channel';
import { WebhookChannel } from './channels/webhook.channel';
import { DiscordChannel } from './channels/discord.channel';

interface CreateIntegrationDto {
  name: string;
  channelType: ChannelType;
  webhookUrl: string;
  authToken?: string;
  config?: any;
}

interface CreateRuleDto {
  name: string;
  description?: string;
  trigger: EventType;
  integrationIds: string[];
  messageTemplate?: string;
  condition?: string;
  status?: RuleStatus;
}

@Injectable()
export class IntegrationsService implements OnModuleInit {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    @InjectRepository(Integration)
    private readonly integrationRepo: Repository<Integration>,
    @InjectRepository(AutomationRule)
    private readonly ruleRepo: Repository<AutomationRule>,
    @InjectRepository(AutomationRun)
    private readonly runRepo: Repository<AutomationRun>,
    private readonly events: EventEmitter2,
    private readonly slackCh: SlackChannel,
    private readonly teamsCh: TeamsChannel,
    private readonly webhookCh: WebhookChannel,
    private readonly discordCh: DiscordChannel,
  ) {}

  onModuleInit() {
    // Wire wildcard listener — catch every JOSMEF event
    this.events.onAny((event: any, data: any) => {
      if (typeof event !== 'string' || !event.includes('.')) return;
      this.handleEvent(event as EventType, data).catch(err => {
        this.logger.error(`Event handler failed for ${event}: ${err.message}`);
      });
    });
    this.logger.log('Wildcard event listener registered');
  }

  // ─── Integration CRUD ─────────────────────────────────
  listIntegrations() {
    return this.integrationRepo.find({ order: { createdAt: 'DESC' } });
  }

  findIntegration(id: string) {
    return this.integrationRepo.findOne({ where: { id } });
  }

  createIntegration(dto: CreateIntegrationDto) {
    if (!dto.webhookUrl || !dto.webhookUrl.startsWith('http')) {
      throw new BadRequestException('webhookUrl must be a valid http(s) URL');
    }
    return this.integrationRepo.save(this.integrationRepo.create(dto));
  }

  async updateIntegration(id: string, dto: Partial<CreateIntegrationDto> & { isActive?: boolean }) {
    const i = await this.findIntegration(id);
    if (!i) throw new NotFoundException('Integration not found');
    Object.assign(i, dto);
    return this.integrationRepo.save(i);
  }

  async deleteIntegration(id: string) {
    const i = await this.findIntegration(id);
    if (!i) throw new NotFoundException('Integration not found');
    await this.integrationRepo.softRemove(i);
    return { ok: true };
  }

  /** Send a test message to verify the integration is wired correctly. */
  async testIntegration(id: string) {
    const i = await this.findIntegration(id);
    if (!i) throw new NotFoundException('Integration not found');
    return this.deliverTo(i, {
      title: '✅ JOSMEF test notification',
      message: `This is a test message from your JOSMEF HRMS integration "${i.name}". If you see this, your integration is working.`,
      severity: 'success',
      fields: [
        { label: 'Channel', value: i.channelType },
        { label: 'Integration', value: i.name },
      ],
    });
  }

  // ─── Automation rules ─────────────────────────────────
  listRules() {
    return this.ruleRepo.find({ order: { createdAt: 'DESC' } });
  }

  findRule(id: string) {
    return this.ruleRepo.findOne({ where: { id } });
  }

  createRule(dto: CreateRuleDto) {
    if (!dto.integrationIds?.length) {
      throw new BadRequestException('At least one integration required');
    }
    return this.ruleRepo.save(this.ruleRepo.create(dto));
  }

  async updateRule(id: string, dto: Partial<CreateRuleDto> & { status?: RuleStatus }) {
    const r = await this.findRule(id);
    if (!r) throw new NotFoundException('Rule not found');
    Object.assign(r, dto);
    return this.ruleRepo.save(r);
  }

  async deleteRule(id: string) {
    const r = await this.findRule(id);
    if (!r) throw new NotFoundException('Rule not found');
    await this.ruleRepo.softRemove(r);
    return { ok: true };
  }

  listRuns(limit = 100) {
    return this.runRepo.find({ order: { createdAt: 'DESC' }, take: limit });
  }

  // ─── Event handling ───────────────────────────────────
  /**
   * Called when ANY JOSMEF event fires. Looks up matching active rules,
   * fans the payload to all configured integrations, records run history.
   */
  async handleEvent(event: EventType, data: any) {
    const rules = await this.ruleRepo.find({
      where: { trigger: event, status: RuleStatus.ACTIVE },
    });
    if (!rules.length) return;

    for (const rule of rules) {
      const integrations = await this.integrationRepo.find({
        where: { id: In(rule.integrationIds), isActive: true },
      });
      if (!integrations.length) continue;

      const payload = this.buildPayload(rule, event, data);
      for (const integration of integrations) {
        try {
          const r = await this.deliverTo(integration, payload);
          await this.recordRun(rule, event, data, true, undefined, r.status);
        } catch (err: any) {
          await this.recordRun(rule, event, data, false, err.message);
          this.logger.warn(`Delivery to ${integration.name} failed: ${err.message}`);
        }
      }

      // Update rule stats
      rule.triggerCount = (rule.triggerCount ?? 0) + 1;
      rule.lastTriggeredAt = new Date();
      await this.ruleRepo.save(rule);
    }
  }

  private async deliverTo(integration: Integration, payload: ChannelDeliveryPayload) {
    const handler = this.channelHandlerFor(integration.channelType);
    try {
      const result = await handler.send(integration, payload);
      integration.lastDeliveredAt = new Date();
      integration.lastError = '';
      integration.deliveryCount = (integration.deliveryCount ?? 0) + 1;
      await this.integrationRepo.save(integration);
      return result;
    } catch (err: any) {
      integration.lastError = err.message;
      integration.errorCount = (integration.errorCount ?? 0) + 1;
      await this.integrationRepo.save(integration);
      throw err;
    }
  }

  private channelHandlerFor(type: ChannelType) {
    switch (type) {
      case ChannelType.SLACK: return this.slackCh;
      case ChannelType.TEAMS: return this.teamsCh;
      case ChannelType.DISCORD: return this.discordCh;
      case ChannelType.WEBHOOK:
      case ChannelType.EMAIL:  // email handled by generic webhook for now
      default: return this.webhookCh;
    }
  }

  /** Renders the message template with simple {{path.to.value}} placeholders. */
  private buildPayload(rule: AutomationRule, event: EventType, data: any): ChannelDeliveryPayload {
    const eventLabel = event
      .replace(/\./g, ' ')
      .replace(/_/g, ' ')
      .toUpperCase();

    const message = rule.messageTemplate
      ? this.renderTemplate(rule.messageTemplate, data)
      : `Event: ${eventLabel}\nDetails: ${JSON.stringify(data).slice(0, 500)}`;

    const severity: ChannelDeliveryPayload['severity'] =
      event.includes('expired') || event.includes('overdue') ? 'critical' :
      event.includes('expiring') ? 'warning' :
      event.includes('approved') || event.includes('released') ? 'success' : 'info';

    return {
      title: `${rule.name} — ${eventLabel}`,
      message,
      severity,
      link: data?.link,
      fields: this.fieldsFromData(data),
    };
  }

  private renderTemplate(template: string, data: any): string {
    return template.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
      const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], data);
      return value != null ? String(value) : '';
    });
  }

  private fieldsFromData(data: any): Array<{ label: string; value: string }> {
    if (!data || typeof data !== 'object') return [];
    const fields: Array<{ label: string; value: string }> = [];
    const PREFERRED = ['employeeName', 'employeeNumber', 'licenseType', 'licenseNumber',
                       'leaveCode', 'totalDays', 'shiftDate', 'dueDate'];
    for (const key of PREFERRED) {
      if (data[key] != null) {
        fields.push({ label: this.humanize(key), value: String(data[key]) });
      }
    }
    return fields.slice(0, 6);
  }

  private humanize(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();
  }

  private async recordRun(
    rule: AutomationRule,
    event: EventType,
    payload: any,
    success: boolean,
    error?: string,
    responseStatus?: number,
  ) {
    try {
      await this.runRepo.save(this.runRepo.create({
        ruleId: rule.id,
        event,
        payload,
        success,
        error,
        responseStatus,
      }));
    } catch {
      // never let logging break the main flow
    }
  }

  /**
   * Manually emit an event from anywhere in the app.
   *   integrationsService.emit(EventType.LEAVE_REQUESTED, { employeeName: '...' })
   */
  emit(event: EventType, data: any) {
    this.events.emit(event, data);
  }

  /** List event types — used by frontend rule builder dropdown. */
  listEventTypes() {
    return Object.values(EventType).map(t => ({
      value: t,
      label: t.replace(/\./g, ' ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    }));
  }
}

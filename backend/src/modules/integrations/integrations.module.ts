import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Integration, AutomationRule, AutomationRun } from './entities/integration.entity';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController, AutomationsController } from './integrations.controller';
import { SlackChannel } from './channels/slack.channel';
import { TeamsChannel } from './channels/teams.channel';
import { WebhookChannel } from './channels/webhook.channel';
import { DiscordChannel } from './channels/discord.channel';

/**
 * Global module — IntegrationsService is exported so other modules (compliance,
 * leave, employees, shifts, etc.) can emit events via `integrationsService.emit()`.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Integration, AutomationRule, AutomationRun]),
    EventEmitterModule.forRoot({ wildcard: true, maxListeners: 50 }),
  ],
  controllers: [IntegrationsController, AutomationsController],
  providers: [
    IntegrationsService,
    SlackChannel,
    TeamsChannel,
    WebhookChannel,
    DiscordChannel,
  ],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}

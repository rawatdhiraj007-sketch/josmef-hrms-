import { Injectable } from '@nestjs/common';
import { ChannelHandler, ChannelDeliveryPayload } from './channel.interface';
import { Integration } from '../entities/integration.entity';

/**
 * Discord delivery via webhook URL.
 * Setup: Server settings → Integrations → Webhooks → New Webhook
 */
@Injectable()
export class DiscordChannel implements ChannelHandler {
  async send(integration: Integration, payload: ChannelDeliveryPayload) {
    const color =
      payload.severity === 'critical' ? 0xdc2626 :
      payload.severity === 'warning' ? 0xf59e0b :
      payload.severity === 'success' ? 0x10b981 : 0x6366f1;

    const fields = payload.fields?.map(f => ({
      name: f.label,
      value: f.value,
      inline: true,
    })) ?? [];

    const body = {
      embeds: [{
        title: payload.title,
        description: payload.message,
        color,
        fields,
        url: payload.link,
        footer: { text: 'JOSMEF HRMS' },
        timestamp: new Date().toISOString(),
      }],
    };

    const res = await fetch(integration.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Discord returned ${res.status}: ${text.slice(0, 200)}`);
    }
    return { status: res.status };
  }
}

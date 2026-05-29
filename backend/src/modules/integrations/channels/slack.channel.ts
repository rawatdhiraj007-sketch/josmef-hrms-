import { Injectable } from '@nestjs/common';
import { ChannelHandler, ChannelDeliveryPayload } from './channel.interface';
import { Integration } from '../entities/integration.entity';

/**
 * Slack delivery via incoming-webhook URL.
 * Setup: https://api.slack.com/messaging/webhooks
 */
@Injectable()
export class SlackChannel implements ChannelHandler {
  async send(integration: Integration, payload: ChannelDeliveryPayload) {
    const color =
      payload.severity === 'critical' ? '#dc2626' :
      payload.severity === 'warning' ? '#f59e0b' :
      payload.severity === 'success' ? '#10b981' : '#6366f1';

    const fields = payload.fields?.map(f => ({
      title: f.label,
      value: f.value,
      short: true,
    })) ?? [];

    if (payload.link) {
      fields.push({ title: 'Link', value: `<${payload.link}|Open in app>`, short: false });
    }

    const body = {
      text: payload.title,
      attachments: [{
        color,
        fallback: payload.message,
        title: payload.title,
        text: payload.message,
        fields,
        footer: 'JOSMEF HRMS',
        ts: Math.floor(Date.now() / 1000),
      }],
    };

    const res = await fetch(integration.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Slack returned ${res.status}: ${text.slice(0, 200)}`);
    }
    return { status: res.status };
  }
}

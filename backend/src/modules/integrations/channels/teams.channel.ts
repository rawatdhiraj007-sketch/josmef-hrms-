import { Injectable } from '@nestjs/common';
import { ChannelHandler, ChannelDeliveryPayload } from './channel.interface';
import { Integration } from '../entities/integration.entity';

/**
 * Microsoft Teams delivery via incoming-webhook URL.
 * Setup: Channel → Connectors → Incoming Webhook
 */
@Injectable()
export class TeamsChannel implements ChannelHandler {
  async send(integration: Integration, payload: ChannelDeliveryPayload) {
    const color =
      payload.severity === 'critical' ? 'dc2626' :
      payload.severity === 'warning' ? 'f59e0b' :
      payload.severity === 'success' ? '10b981' : '6366f1';

    const facts = payload.fields?.map(f => ({ name: f.label, value: f.value })) ?? [];

    const body = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor: color,
      summary: payload.title,
      title: payload.title,
      text: payload.message,
      sections: facts.length ? [{ facts }] : undefined,
      potentialAction: payload.link ? [{
        '@type': 'OpenUri',
        name: 'Open in app',
        targets: [{ os: 'default', uri: payload.link }],
      }] : undefined,
    };

    const res = await fetch(integration.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Teams returned ${res.status}: ${text.slice(0, 200)}`);
    }
    return { status: res.status };
  }
}

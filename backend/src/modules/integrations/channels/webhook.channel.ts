import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ChannelHandler, ChannelDeliveryPayload } from './channel.interface';
import { Integration } from '../entities/integration.entity';

/**
 * Generic outbound webhook — sends full event JSON to any URL.
 * Adds HMAC-SHA256 signature header if authToken is set.
 */
@Injectable()
export class WebhookChannel implements ChannelHandler {
  async send(integration: Integration, payload: ChannelDeliveryPayload) {
    const body = JSON.stringify({
      source: 'josmef-hrms',
      timestamp: new Date().toISOString(),
      ...payload,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-JOSMEF-Event': payload.title,
    };

    // Sign with HMAC-SHA256 if secret was provided
    if (integration.authToken) {
      const sig = crypto
        .createHmac('sha256', integration.authToken)
        .update(body)
        .digest('hex');
      headers['X-JOSMEF-Signature'] = `sha256=${sig}`;
    }

    const res = await fetch(integration.webhookUrl, {
      method: 'POST',
      headers,
      body,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Webhook returned ${res.status}: ${text.slice(0, 200)}`);
    }
    return { status: res.status };
  }
}

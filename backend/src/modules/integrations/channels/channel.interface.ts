import { Integration } from '../entities/integration.entity';

export interface ChannelDeliveryPayload {
  title: string;
  message: string;
  severity?: 'info' | 'success' | 'warning' | 'critical';
  link?: string;
  fields?: Array<{ label: string; value: string }>;
}

export interface ChannelHandler {
  /**
   * Deliver a notification payload to a channel.
   * Throws on transport-level errors; returns the HTTP status on completion.
   */
  send(integration: Integration, payload: ChannelDeliveryPayload): Promise<{ status: number }>;
}

import { randomUUID } from 'node:crypto';
import {
  EventBridgeV2Client,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridgev2';

const client = new EventBridgeV2Client({});
const ORDERS_BUS_ARN = process.env.ORDERS_BUS_ARN;

// Publishes `count` OrderPlaced events for one customer. The customer id is
// the event group, so a subscriber with `ordering: fifo` receives these
// events in the order they are published here. Each event is published with
// its own call, after the previous call has returned, so the publish order
// is the order of `sequence`.
export const publish = async (input = {}) => {
  const count = Math.min(Math.max(Number(input.count) || 3, 1), 10);
  const customerId = input.customerId ?? `customer-${randomUUID().slice(0, 8)}`;
  const published = [];

  for (let sequence = 1; sequence <= count; sequence++) {
    const orderId = randomUUID();
    const response = await client.send(
      new PutEventsCommand({
        EventBusArn: ORDERS_BUS_ARN,
        Entries: [
          {
            Source: 'orders.producer',
            DetailType: 'OrderPlaced',
            Detail: JSON.stringify({ orderId, customerId, sequence }),
            SystemMetadata: { EventGroupId: customerId },
          },
        ],
      }),
    );
    if (response.FailedEntryCount) {
      throw new Error(
        `PutEvents rejected: ${JSON.stringify(response.Entries)}`,
      );
    }
    published.push({ sequence, orderId, eventId: response.Entries[0].EventId });
  }

  return { customerId, published };
};

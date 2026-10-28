// `fulfil` subscribes with `batchSize: 1`, so it receives one event object.
// With `ordering: fifo`, events that share an event group arrive in the order
// they were published, one at a time.
export const fulfil = async (event) => {
  const { orderId, sequence } = event.detail;
  console.log(
    JSON.stringify({ handler: 'fulfil', orderId, sequence, id: event.id }),
  );
};

// `audit` subscribes with the defaults, so it receives an array of events,
// even when a batch holds only one.
export const audit = async (events) => {
  console.log(
    JSON.stringify({
      handler: 'audit',
      received: events.length,
      orders: events.map((event) => event.detail.orderId),
    }),
  );
};

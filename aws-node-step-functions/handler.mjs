// The two steps of the state machine. Step Functions passes each function the
// state's input and passes what it returns on as the next state's input.

// Accepts an order when it has an orderId. The Choice state after this step
// reads `valid` to pick the next state.
export const validateOrder = async (event) => ({
  orderId: event?.orderId ?? null,
  valid: typeof event?.orderId === 'string' && event.orderId.length > 0,
  acceptedAt: new Date().toISOString(),
})

// Runs after the Wait state. A thrown error here is retried by the Retry
// field of the ProcessOrder state.
export const processOrder = async (order) => ({
  orderId: order.orderId,
  status: 'processed',
  acceptedAt: order.acceptedAt,
  completedAt: new Date().toISOString(),
})

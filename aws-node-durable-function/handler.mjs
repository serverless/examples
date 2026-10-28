import { withDurableExecution } from '@aws/durable-execution-sdk-js'

// withDurableExecution checkpoints each step. When the function resumes after
// the wait, Lambda replays the handler from the start and returns the stored
// result of a completed step instead of running it again.
export const worker = withDurableExecution(async (event, context) => {
  const order = await context.step('accept-order', async () => ({
    orderId: event?.orderId ?? 'unknown',
    acceptedAt: new Date().toISOString(),
  }))

  // The function stops here and Lambda resumes it later. No compute is billed
  // while it waits.
  await context.wait({ seconds: 10 })

  return { ...order, completedAt: new Date().toISOString() }
})

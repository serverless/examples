import { randomUUID } from 'node:crypto'
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'

// The parts of an HTTP API event and result this handler uses.
interface HttpEvent {
  body?: string
  isBase64Encoded?: boolean
}

interface HttpResult {
  statusCode: number
  headers: Record<string, string>
  body: string
}

interface JobRequest {
  task: string
}

const sqs = new SQSClient({})

const json = (statusCode: number, value: unknown): HttpResult => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(value),
})

const isJobRequest = (value: unknown): value is JobRequest =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { task?: unknown }).task === 'string'

// POST /jobs: queues the task for the worker and answers with the job's id.
export const createJob = async (event: HttpEvent): Promise<HttpResult> => {
  const text = event.isBase64Encoded
    ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
    : (event.body ?? '')
  let input: unknown
  try {
    input = JSON.parse(text)
  } catch {
    return json(400, { message: 'Send a JSON body: {"task": "<text>"}.' })
  }
  if (!isJobRequest(input)) {
    return json(400, { message: 'Send a JSON body: {"task": "<text>"}.' })
  }
  const job = {
    id: randomUUID(),
    task: input.task,
    createdAt: new Date().toISOString(),
  }
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: JSON.stringify(job),
    }),
  )
  console.log(`queued job ${job.id}`)
  return json(202, { id: job.id })
}

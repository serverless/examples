// Does what the README's Try it does: posts a valid job and a job without a
// task to the HTTP API, which puts both on the jobs queue. Then waits for the
// worker's log line for the valid job, and for the other job to arrive in the
// dead-letter queue after the worker reported it as failed three times.
//
// Run by the example test runner, with the stack outputs in EXAMPLE_OUTPUTS,
// EXAMPLE_REGION set and AWS credentials in the environment. It calls the aws
// CLI to read the worker's log group (logs filter-log-events) and the
// dead-letter queue (sqs receive-message).

import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const DELAY_MS = 3_000;
const API_WAIT_MS = 90_000;
const LOG_WAIT_MS = 120_000;
// Three receives, 36 seconds of visibility timeout apart, then the move to the dead-letter queue.
const DLQ_WAIT_MS = 300_000;

const outputs = JSON.parse(process.env.EXAMPLE_OUTPUTS ?? '{}');
const apiUrl = outputs.HttpApiUrl;
const functionArn = outputs.WorkerLambdaFunctionQualifiedArn;
const dlqUrl = outputs.DeadLetterQueueUrl;
if (!apiUrl || !functionArn || !dlqUrl) {
  fail(`stack outputs HttpApiUrl, WorkerLambdaFunctionQualifiedArn and DeadLetterQueueUrl needed; got ${Object.keys(outputs).join(', ')}`);
}
// arn:aws:lambda:<region>:<account>:function:<name>:<version>
const logGroup = `/aws/lambda/${functionArn.split(':')[6]}`;
const region = ['--region', process.env.EXAMPLE_REGION ?? 'us-east-1'];

const tag = randomBytes(4).toString('hex');
const start = Date.now();
const goodId = await postJob({ task: `resize photo-${tag}.png` });
const badId = await postJob({ name: `photo-${tag}.png` });

// Lambda polls the queue, so the worker's line appears after a moment.
const wanted = `Processed job ${goodId}: resize photo-${tag}.png`;
let text = '';
for (;;) {
  try {
    const out = aws(['logs', 'filter-log-events', ...region, '--log-group-name', logGroup,
      '--filter-pattern', `"${goodId}"`, '--start-time', String(start - 60_000), '--output', 'json']);
    if (JSON.parse(out).events.some((e) => e.message.includes(wanted))) break;
    text = 'no matching line yet';
  } catch (err) {
    // The log group exists only after the first invocation.
    text = err.message;
  }
  if (Date.now() - start >= LOG_WAIT_MS) fail(`${logGroup}: no "${wanted}" line within ${LOG_WAIT_MS / 1000} s; last: ${text.slice(0, 300)}`);
  await sleep(DELAY_MS);
}

// The job without a task fails on every receive and then moves to the dead-letter queue.
let found;
const seen = new Set();
for (;;) {
  const out = aws(['sqs', 'receive-message', ...region, '--queue-url', dlqUrl, '--max-number-of-messages', '10',
    '--wait-time-seconds', '10', '--visibility-timeout', '0', '--output', 'json']);
  const messages = out.trim() ? (JSON.parse(out).Messages ?? []) : [];
  for (const m of messages) seen.add(m.MessageId);
  found = messages.find((m) => m.MessageId === badId);
  if (found) break;
  if (seen.has(goodId)) fail(`dead-letter queue: the processed job ${goodId} arrived there too`);
  if (Date.now() - start >= DLQ_WAIT_MS) fail(`dead-letter queue: expected message ${badId} within ${DLQ_WAIT_MS / 1000} s; saw ${[...seen].join(', ') || 'none'}`);
}
if (!found.Body.includes(`photo-${tag}.png`)) fail(`dead-letter queue: expected the body of ${badId} to name photo-${tag}.png; got ${found.Body}`);

console.log(`POST /jobs -> worker logged "${wanted}"; job ${badId} without a task -> dead-letter queue`);

async function postJob(job) {
  let res;
  let body;
  for (;;) {
    // A new HTTP API can take a moment to answer, so the request retries.
    try {
      res = await fetch(`${apiUrl}/jobs`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(job),
      });
      body = await res.text();
      if (res.status === 202) break;
    } catch (err) {
      body = `request error: ${err.message}`;
    }
    if (Date.now() - start >= API_WAIT_MS) fail(`POST /jobs: expected status 202; last: ${res?.status} ${body.slice(0, 300)}`);
    await sleep(DELAY_MS);
  }
  const { messageId } = JSON.parse(body);
  if (!messageId) fail(`POST /jobs: expected a messageId; got ${body.slice(0, 300)}`);
  return messageId;
}

function aws(args) {
  try {
    return execFileSync('aws', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    throw new Error(`aws ${args.slice(0, 2).join(' ')}: exit ${err.status}, ${String(err.stderr ?? '').trim().slice(0, 300)}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fail(message) {
  console.error(`smoke test failed: ${message}`);
  process.exit(1);
}

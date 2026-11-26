// Does what the README's Try it does: publishes two OrderPlaced events to the
// default event bus, one with a total of 250 and one with a total of 40. Then
// waits for the function's log line for the first order, and checks that the
// second, which the rule's pattern filters out, never reached the function.
//
// Run by the example test runner, with the stack outputs in EXAMPLE_OUTPUTS,
// EXAMPLE_REGION set and AWS credentials in the environment. It calls the aws
// CLI to publish the events (events put-events) and to read the function's log
// group (logs filter-log-events).

import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const DELAY_MS = 3_000;
// A new rule can take a moment to match events, so the events are published again until one arrives.
const LOG_WAIT_MS = 180_000;
const REPUBLISH_MS = 30_000;
// After the matching order arrived, how long the filtered order has to show up if the filter didn't hold.
const FILTERED_WAIT_MS = 20_000;

const outputs = JSON.parse(process.env.EXAMPLE_OUTPUTS ?? '{}');
const functionArn = outputs.OrderPlacedLambdaFunctionQualifiedArn;
if (!functionArn) fail(`stack output OrderPlacedLambdaFunctionQualifiedArn needed; got ${Object.keys(outputs).join(', ')}`);
// arn:aws:lambda:<region>:<account>:function:<name>:<version>
const logGroup = `/aws/lambda/${functionArn.split(':')[6]}`;
const region = ['--region', process.env.EXAMPLE_REGION ?? 'us-east-1'];

const tag = randomBytes(4).toString('hex');
const bigOrder = `o-${tag}-1`;
const smallOrder = `o-${tag}-2`;
const wanted = `Order ${bigOrder} placed: total 250`;
const start = Date.now();

let lastPublish = 0;
let text = '';
for (;;) {
  if (Date.now() - lastPublish >= REPUBLISH_MS) {
    publish();
    lastPublish = Date.now();
  }
  const lines = logLines();
  if (lines.some((line) => line.includes(wanted))) break;
  text = lines.length ? lines.join(' | ') : 'no line for this run yet';
  if (Date.now() - start >= LOG_WAIT_MS) fail(`${logGroup}: no "${wanted}" line within ${LOG_WAIT_MS / 1000} s; last: ${text.slice(0, 300)}`);
  await sleep(DELAY_MS);
}

await sleep(FILTERED_WAIT_MS);
const filtered = logLines().filter((line) => line.includes(smallOrder));
if (filtered.length) fail(`${logGroup}: order ${smallOrder} with a total of 40 reached the function: ${filtered[0].slice(0, 300)}`);

console.log(`put-events -> function logged "${wanted}"; order ${smallOrder} with a total of 40 was filtered out`);

function publish() {
  const entries = [
    { orderId: bigOrder, total: 250 },
    { orderId: smallOrder, total: 40 },
  ].map((detail) => ({ Source: 'orders.app', DetailType: 'OrderPlaced', Detail: JSON.stringify(detail) }));
  const out = JSON.parse(aws(['events', 'put-events', ...region, '--entries', JSON.stringify(entries), '--output', 'json']));
  if (out.FailedEntryCount) fail(`put-events: ${JSON.stringify(out.Entries).slice(0, 300)}`);
}

function logLines() {
  try {
    const out = aws(['logs', 'filter-log-events', ...region, '--log-group-name', logGroup,
      '--filter-pattern', `"o-${tag}"`, '--start-time', String(start - 60_000), '--output', 'json']);
    return JSON.parse(out).events.map((e) => e.message.trim());
  } catch (err) {
    // The log group exists only after the first invocation.
    text = err.message;
    return [];
  }
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

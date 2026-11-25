// Does what the README's Try it does: invokes the producer to publish five
// OrderPlaced events for one customer to the Custom Event Bus, then waits for
// both consumers. `fulfil` must log the five orders one per invocation, in
// publish order; `audit` must receive all five, in arrays.
//
// Run by the example test runner with EXAMPLE_STAGE and EXAMPLE_REGION set and
// AWS credentials in the environment. It calls the aws CLI to invoke the
// producer (lambda invoke) and to read the consumers' log groups
// (logs filter-log-events).
//
// Function names, each with the stage:
//   compose-eventbus-producer-<stage>-publish
//   compose-eventbus-orders-<stage>-fulfil
//   compose-eventbus-orders-<stage>-audit

import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const COUNT = 5;
const DELAY_MS = 3_000;
const LOG_WAIT_MS = 180_000;

const stage = process.env.EXAMPLE_STAGE;
const region = process.env.EXAMPLE_REGION ?? process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;
if (!stage) fail('EXAMPLE_STAGE is not set');
if (!region) fail('EXAMPLE_REGION is not set');

const customerId = `customer-${randomBytes(4).toString('hex')}`;
const start = Date.now();
const published = publish();
const orderIds = published.map((p) => p.orderId);

let fulfilled = [];
let audited = new Set();
for (;;) {
  fulfilled = handlerLines('fulfil').filter((l) => orderIds.includes(l.orderId));
  audited = new Set(handlerLines('audit').flatMap((l) => l.orders ?? []).filter((id) => orderIds.includes(id)));
  if (fulfilled.length >= COUNT && audited.size === COUNT) break;
  if (Date.now() - start >= LOG_WAIT_MS) {
    fail(`within ${LOG_WAIT_MS / 1000} s, fulfil logged ${fulfilled.length} of ${COUNT} orders and audit received ${audited.size} of ${COUNT}`);
  }
  await sleep(DELAY_MS);
}

const sequences = fulfilled.map((l) => l.sequence);
const expected = published.map((p) => p.sequence);
if (JSON.stringify(sequences) !== JSON.stringify(expected)) {
  fail(`fulfil: expected sequences ${expected.join(',')} in that order; got ${sequences.join(',')}`);
}

console.log(`published ${COUNT} orders for ${customerId} -> fulfil logged sequences ${sequences.join(',')} in order; audit received all ${COUNT}`);

function publish() {
  const outFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'eventbus-smoke-')), 'out.json');
  aws(['lambda', 'invoke', '--function-name', `compose-eventbus-producer-${stage}-publish`,
    '--cli-binary-format', 'raw-in-base64-out', '--payload', JSON.stringify({ count: COUNT, customerId }), outFile]);
  const result = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  if (result.customerId !== customerId || result.published?.length !== COUNT) {
    fail(`producer: expected ${COUNT} published orders for ${customerId}; got ${JSON.stringify(result).slice(0, 300)}`);
  }
  return result.published;
}

// The handler's JSON log lines, oldest first.
function handlerLines(fn) {
  let events;
  try {
    events = JSON.parse(aws(['logs', 'filter-log-events', '--log-group-name', `/aws/lambda/compose-eventbus-orders-${stage}-${fn}`,
      '--filter-pattern', `"${fn}"`, '--start-time', String(start - 60_000)])).events;
  } catch {
    // The log group exists only after the first invocation.
    return [];
  }
  return events
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((e) => e.message.slice(e.message.indexOf('{')))
    .flatMap((text) => {
      try {
        const line = JSON.parse(text);
        return line.handler === fn ? [line] : [];
      } catch {
        return [];
      }
    });
}

function aws(args) {
  try {
    return execFileSync('aws', [...args, '--region', region, '--output', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
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

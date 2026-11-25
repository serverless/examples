// Does what the README's Try it does: posts a note to the HTTP API, which
// publishes it to the SNS topic, then waits for the analyzeNote function's log
// line for that message and checks the analysis it logged.
//
// Run by the example test runner, with the stack outputs in EXAMPLE_OUTPUTS,
// EXAMPLE_REGION set and AWS credentials in the environment. It reads the
// analyzeNote function's log group with the aws CLI (logs filter-log-events).

import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const WAIT_MS = 90_000;
const DELAY_MS = 3_000;

const outputs = JSON.parse(process.env.EXAMPLE_OUTPUTS ?? '{}');
const apiUrl = outputs.HttpApiUrl;
const functionArn = outputs.AnalyzeNoteLambdaFunctionQualifiedArn;
if (!apiUrl || !functionArn) {
  fail(`stack outputs HttpApiUrl and AnalyzeNoteLambdaFunctionQualifiedArn needed; got ${Object.keys(outputs).join(', ')}`);
}
// arn:aws:lambda:<region>:<account>:function:<name>:<version>
const logGroup = `/aws/lambda/${functionArn.split(':')[6]}`;
const region = ['--region', process.env.EXAMPLE_REGION ?? 'us-east-1'];

const tag = randomBytes(4).toString('hex');
const note = `Smoke test note ${tag} arrived. It has two sentences!`;
const expected = '9 words, 2 sentences, 55 characters';

// A new HTTP API can take a moment to answer, so the first request retries.
const start = Date.now();
let res;
let text;
for (;;) {
  try {
    res = await fetch(`${apiUrl}/notes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    text = await res.text();
    if (res.status === 202) break;
  } catch (err) {
    text = `request error: ${err.message}`;
  }
  if (Date.now() - start >= WAIT_MS) fail(`POST /notes: expected status 202; last: ${res?.status} ${text.slice(0, 300)}`);
  await sleep(DELAY_MS);
}
const { messageId } = JSON.parse(text);
if (!messageId) fail(`POST /notes: expected a messageId; got ${text.slice(0, 300)}`);

// SNS invokes analyzeNote asynchronously, so its log line appears after a moment.
const wanted = `Analyzed note ${messageId}:`;
let line;
for (;;) {
  try {
    const out = aws(['logs', 'filter-log-events', ...region, '--log-group-name', logGroup,
      '--filter-pattern', `"${messageId}"`, '--start-time', String(start - 60_000), '--output', 'json']);
    line = JSON.parse(out).events.map((e) => e.message).find((m) => m.includes(wanted));
  } catch (err) {
    // The log group exists only after the first invocation.
    line = undefined;
    text = err.message;
  }
  if (line) break;
  if (Date.now() - start >= 2 * WAIT_MS) fail(`${logGroup}: no "${wanted}" line within ${(2 * WAIT_MS) / 1000} s; last: ${text.slice(0, 300)}`);
  await sleep(DELAY_MS);
}

if (!line.includes(`${wanted} ${expected}`)) fail(`${logGroup}: expected "${wanted} ${expected}"; got "${line.trim()}"`);
console.log(`POST /notes -> SNS message ${messageId} -> analyzeNote logged "${expected}"`);

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

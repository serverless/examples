// Starts a durable execution the way the README's Try it does, waits for it to
// finish, and checks what the handler returned: the order it was sent, and a
// completion at least 9 seconds after acceptance, since the handler waits 10
// seconds between its step and its return.
//
// Run by the example test runner in the example directory, with EXAMPLE_STAGE
// and EXAMPLE_REGION set and AWS credentials in the environment. It starts the
// execution with serverless invoke and reads it with the aws CLI.

import { execFileSync } from 'node:child_process';

const POLL_WINDOW_MS = 90_000;
const POLL_DELAY_MS = 3_000;
const MIN_WAIT_MS = 9_000;
const OTHER_END_STATES = ['FAILED', 'TIMED_OUT', 'STOPPED'];

const stage = process.env.EXAMPLE_STAGE;
const region = process.env.EXAMPLE_REGION;
const cwd = process.env.EXAMPLE_DIR ?? process.cwd();
if (!stage) fail('EXAMPLE_STAGE is not set');
const regionArgs = region ? ['--region', region] : [];

const orderId = `smoke-${Math.random().toString(36).slice(2, 10)}`;
const started = run('serverless', ['invoke', '-f', 'worker', '--type', 'Event', '-d', JSON.stringify({ orderId }), '--json', '--stage', stage, ...regionArgs]);
const arn = executionArn(started);

const execution = await waitForEnd(arn);
const result = parseResult(execution.Result);
expectOrder(result);
expectWait(result);

console.log(`execution ${arn}: SUCCEEDED; order ${orderId} completed ${(Date.parse(result.completedAt) - Date.parse(result.acceptedAt)) / 1000} s after it was accepted`);

// The durableExecutionArn of the JSON object serverless invoke --json prints on stdout.
function executionArn(stdout) {
  const line = stdout
    .split('\n')
    .map((l) => l.trim())
    .findLast((l) => l.startsWith('{'));
  let body;
  try {
    body = JSON.parse(line ?? '');
  } catch {
    fail(`serverless invoke --json: expected a JSON object on stdout; got ${stdout.slice(0, 300)}`);
  }
  if (typeof body.durableExecutionArn !== 'string' || !body.durableExecutionArn.startsWith('arn:')) {
    fail(`serverless invoke --json: expected durableExecutionArn; got ${line.slice(0, 300)}`);
  }
  return body.durableExecutionArn;
}

// Reads the execution every POLL_DELAY_MS until its Status is SUCCEEDED, for up
// to POLL_WINDOW_MS; another end state stops at once.
async function waitForEnd(executionArn) {
  const start = Date.now();
  let last;
  for (;;) {
    try {
      const execution = JSON.parse(
        execFileSync('aws', ['lambda', 'get-durable-execution', '--durable-execution-arn', executionArn, '--output', 'json', ...regionArgs], {
          cwd,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        }),
      );
      if (execution.Status === 'SUCCEEDED') return execution;
      if (OTHER_END_STATES.includes(execution.Status)) fail(`execution ${executionArn}: expected Status SUCCEEDED; got ${execution.Status}`);
      last = `Status ${execution.Status}`;
    } catch (err) {
      last = `aws lambda get-durable-execution: ${(err.stderr || err.message).trim().slice(0, 300)}`;
    }
    if (Date.now() - start >= POLL_WINDOW_MS) fail(`execution ${executionArn}: expected Status SUCCEEDED within ${POLL_WINDOW_MS / 1000} s; last: ${last}`);
    await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
  }
}

// The execution's Result: the JSON text of what the handler returned.
function parseResult(text) {
  try {
    return JSON.parse(text);
  } catch {
    return fail(`Result: expected the handler's JSON; got ${String(text).slice(0, 300)}`);
  }
}

function expectOrder(result) {
  if (result?.orderId !== orderId) fail(`Result: expected orderId ${JSON.stringify(orderId)}; got ${JSON.stringify(result)}`);
}

function expectWait(result) {
  const waited = Date.parse(result.completedAt) - Date.parse(result.acceptedAt);
  if (!(waited >= MIN_WAIT_MS)) {
    fail(`Result: expected completedAt at least ${MIN_WAIT_MS / 1000} s after acceptedAt; got acceptedAt ${result.acceptedAt}, completedAt ${result.completedAt}`);
  }
}

function run(cmd, args) {
  try {
    return execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    return fail(`${cmd} ${args.slice(0, 3).join(' ')}: ${(err.stderr || err.message).trim().slice(0, 300)}`);
  }
}

function fail(message) {
  console.error(`smoke test failed: ${message}`);
  process.exit(1);
}

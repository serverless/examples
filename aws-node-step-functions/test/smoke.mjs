// Runs the state machine the way the README's Try it does, with serverless
// invoke stepf, and checks what it returned:
// - an order with an orderId goes through ValidateOrder, the 10-second Wait
//   and ProcessOrder: status "processed", the same orderId, and a completion at
//   least 9 seconds after acceptance;
// - an order without one takes the Choice state's Default branch to the
//   Rejected Pass state: status "rejected".
//
// Run by the example test runner in the example directory, with EXAMPLE_STAGE
// and EXAMPLE_REGION set and AWS credentials in the environment. serverless
// invoke stepf starts the execution and waits for it to end.

import { execFileSync } from 'node:child_process';

const MIN_WAIT_MS = 9_000;

const stage = process.env.EXAMPLE_STAGE;
const region = process.env.EXAMPLE_REGION;
const cwd = process.env.EXAMPLE_DIR ?? process.cwd();
if (!stage) fail('EXAMPLE_STAGE is not set');
const regionArgs = region ? ['--region', region] : [];

const orderId = `smoke-${Math.random().toString(36).slice(2, 10)}`;
const processed = runStateMachine({ orderId });
const order = expectOutput(processed, { orderId, status: 'processed' });
const waited = Date.parse(order.completedAt) - Date.parse(order.acceptedAt);
if (!(waited >= MIN_WAIT_MS)) {
  fail(`output: expected completedAt at least ${MIN_WAIT_MS / 1000} s after acceptedAt; got ${JSON.stringify(order)}`);
}

const rejected = runStateMachine({});
expectOutput(rejected, { orderId: null, status: 'rejected' });

console.log(
  `execution ${processed.executionArn}: SUCCEEDED, order ${orderId} processed ${waited / 1000} s after it was accepted; ` +
    `execution ${rejected.executionArn}: SUCCEEDED, order without orderId rejected`,
);

// Starts an execution with serverless invoke stepf and returns the execution
// the command prints as JSON on stdout once it has ended.
function runStateMachine(input) {
  const args = ['invoke', 'stepf', '--name', 'orderWorkflow', '--data', JSON.stringify(input), '--stage', stage, ...regionArgs];
  let stdout;
  try {
    stdout = execFileSync('serverless', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    fail(`serverless invoke stepf: ${(err.stderr || err.message).trim().slice(0, 300)}`);
  }
  const start = stdout.indexOf('{');
  try {
    return JSON.parse(stdout.slice(start));
  } catch {
    return fail(`serverless invoke stepf: expected the execution as JSON on stdout; got ${stdout.slice(0, 300)}`);
  }
}

// Checks that the execution SUCCEEDED and that its output has `expected`'s
// fields; returns the parsed output.
function expectOutput(execution, expected) {
  if (execution.status !== 'SUCCEEDED') fail(`execution ${execution.executionArn}: expected status SUCCEEDED; got ${execution.status}`);
  let output;
  try {
    output = JSON.parse(execution.output);
  } catch {
    fail(`execution ${execution.executionArn}: expected JSON output; got ${String(execution.output).slice(0, 300)}`);
  }
  for (const [key, value] of Object.entries(expected)) {
    if (output[key] !== value) fail(`execution ${execution.executionArn}: expected output ${key} ${JSON.stringify(value)}; got ${JSON.stringify(output)}`);
  }
  return output;
}

function fail(message) {
  console.error(`smoke test failed: ${message}`);
  process.exit(1);
}

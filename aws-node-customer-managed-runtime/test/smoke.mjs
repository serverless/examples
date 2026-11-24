// Invokes the app's function the way README.md → Try it does and checks that it
// returns the runtime info file that only the customer-managed runtime's image has.

import { execFileSync } from 'node:child_process';

const EXPECTED = 'Hello from platform-node24 v1';
const { EXAMPLE_STAGE: stage, EXAMPLE_REGION: region, EXAMPLE_DIR: dir } = process.env;
if (!stage || !region || !dir) fail('EXAMPLE_STAGE, EXAMPLE_REGION and EXAMPLE_DIR must be set');

let output;
try {
  output = execFileSync('serverless', ['invoke', '--service=app', '--function', 'hello', '--stage', stage, '--region', region], {
    cwd: dir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (err) {
  fail(`serverless invoke: ${`${err.stdout ?? ''}${err.stderr ?? ''}`.trim().slice(-500) || err.message}`);
}
if (!output.includes(EXPECTED)) fail(`expected the output to contain ${JSON.stringify(EXPECTED)}; got ${JSON.stringify(output.slice(-500))}`);
console.log(`the function ran on the customer-managed runtime: ${EXPECTED}`);

function fail(message) {
  console.error(message);
  process.exit(1);
}

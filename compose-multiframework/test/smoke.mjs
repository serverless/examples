// Checks the three stacks Serverless Compose deploys for this example: the
// shared DynamoDB table exists, and the traditional and SAM functions answer
// over HTTP with that table's name and the stage's domain parameter.
//
// Run by the example test runner with EXAMPLE_STAGE and EXAMPLE_REGION set and
// AWS credentials in the environment; it reads the stacks with the aws CLI.
//
// Stack names:
//   shared-resources-example     the compose service key (the cloudformation service)
//   sam-compose-service-example  stack_name in sam/samconfig.toml
//   traditional-<stage>          service name and stage (the serverless.yml service)

import { execFileSync } from 'node:child_process';

const RETRY_WINDOW_MS = 60_000;
const RETRY_DELAY_MS = 3_000;
const DOMAIN = 'dev-api.acmeinc.com';

const stage = process.env.EXAMPLE_STAGE;
const region = process.env.EXAMPLE_REGION ?? process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;
if (!stage) fail('EXAMPLE_STAGE is not set');
if (!region) fail('EXAMPLE_REGION is not set');
const tableName = `shared-table-${stage}`;

const shared = stackOutputs('shared-resources-example');
if (shared.TableName !== tableName) fail(`shared-resources-example: expected output TableName ${tableName}; got ${shared.TableName}`);
const status = aws(['dynamodb', 'describe-table', '--table-name', tableName]).Table?.TableStatus;
if (status !== 'ACTIVE') fail(`table ${tableName}: expected status ACTIVE; got ${status}`);

await expectAnswer('traditional', stackOutputs(`traditional-${stage}`).HttpApiUrl);
await expectAnswer('sam', stackOutputs('sam-compose-service-example').Endpoint);

console.log(`table ${tableName} is active; traditional and sam answer with it`);

function aws(args) {
  try {
    return JSON.parse(execFileSync('aws', [...args, '--region', region, '--output', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  } catch (err) {
    return fail(`aws ${args.slice(0, 2).join(' ')}: ${(err.stderr || err.message).trim()}`);
  }
}

function stackOutputs(stackName) {
  const stack = aws(['cloudformation', 'describe-stacks', '--stack-name', stackName]).Stacks?.[0];
  return Object.fromEntries((stack?.Outputs ?? []).map((o) => [o.OutputKey, o.OutputValue]));
}

// GETs the function's endpoint until it answers 200 with JSON, for up to
// RETRY_WINDOW_MS, then checks what the handler returns.
async function expectAnswer(service, url) {
  if (!url) fail(`${service}: the stack has no endpoint output`);
  const want = { service, tableName, domain: DOMAIN };
  const start = Date.now();
  let last;
  for (;;) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      if (res.status === 200) {
        const body = JSON.parse(text);
        for (const [key, value] of Object.entries(want)) {
          if (body[key] !== value) fail(`${service}: GET ${url}: expected ${JSON.stringify(want)}; got ${text.slice(0, 300)}`);
        }
        return;
      }
      last = `status ${res.status}, body ${text.slice(0, 300)}`;
    } catch (err) {
      last = `request error: ${err.message}`;
    }
    if (Date.now() - start >= RETRY_WINDOW_MS) fail(`${service}: GET ${url}: expected status 200; last response: ${last}`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
}

function fail(message) {
  console.error(`smoke test failed: ${message}`);
  process.exit(1);
}

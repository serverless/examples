// Does what the README's Try it does: uploads a text file under uploads/ in the
// example's bucket, waits for the postprocess function to write its summary
// under processed/, and checks that the summary describes that file.
//
// Run by the example test runner, with the stack outputs in EXAMPLE_OUTPUTS,
// EXAMPLE_REGION set and AWS credentials in the environment. It calls Amazon S3
// with the aws CLI: put-object, get-object and delete-object on the objects it
// creates, which it deletes again so that the stack's bucket can be removed.

import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const WAIT_MS = 90_000;
const DELAY_MS = 3_000;

const outputs = JSON.parse(process.env.EXAMPLE_OUTPUTS ?? '{}');
const bucket = outputs.UploadBucketName;
if (!bucket) fail(`stack output UploadBucketName not found; got ${Object.keys(outputs).join(', ')}`);
const region = ['--region', process.env.EXAMPLE_REGION ?? 'us-east-1'];

const name = `smoke-${randomBytes(4).toString('hex')}.txt`;
const content = `Hello from ${name}\nThis file was uploaded by the smoke test.\n`;
const expected = {
  source: `uploads/${name}`,
  bytes: Buffer.byteLength(content),
  lines: 2,
  words: 11,
  sha256: createHash('sha256').update(content).digest('hex'),
};
const outputKey = `processed/${name}.json`;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-'));
const input = path.join(tmp, name);
const result = path.join(tmp, 'result.json');
fs.writeFileSync(input, content);

let failure;
try {
  aws(['s3api', 'put-object', ...region, '--bucket', bucket, '--key', expected.source, '--body', input]);
  const summary = await waitForSummary();
  for (const [field, value] of Object.entries(expected)) {
    if (summary[field] !== value) {
      failure = `${outputKey}: expected ${field} ${JSON.stringify(value)}; got ${JSON.stringify(summary[field])} in ${JSON.stringify(summary)}`;
      break;
    }
  }
  if (!failure) {
    console.log(`s3://${bucket}/${expected.source} -> ${outputKey}: ${summary.bytes} bytes, ${summary.lines} lines, ${summary.words} words, sha256 ${summary.sha256.slice(0, 12)}...`);
  }
} catch (err) {
  failure = err.message;
} finally {
  // Leave the bucket empty, so that removing the stack can delete it.
  for (const key of [expected.source, outputKey]) {
    try {
      aws(['s3api', 'delete-object', ...region, '--bucket', bucket, '--key', key]);
    } catch {
      // Reported by the failure above, or the object was never written.
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}
if (failure) fail(failure);

// S3 invokes the function asynchronously, so the summary appears after a moment.
async function waitForSummary() {
  const start = Date.now();
  let last;
  for (;;) {
    try {
      aws(['s3api', 'get-object', ...region, '--bucket', bucket, '--key', outputKey, result]);
      return JSON.parse(fs.readFileSync(result, 'utf8'));
    } catch (err) {
      last = err.message;
    }
    if (Date.now() - start >= WAIT_MS) throw new Error(`${outputKey}: not written within ${WAIT_MS / 1000} s; last: ${last}`);
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  }
}

function aws(args) {
  try {
    return execFileSync('aws', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    throw new Error(`aws ${args.slice(0, 2).join(' ')}: exit ${err.status}, ${String(err.stderr ?? '').trim().slice(0, 300)}`);
  }
}

function fail(message) {
  console.error(`smoke test failed: ${message}`);
  process.exit(1);
}

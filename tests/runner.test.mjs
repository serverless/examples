import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { EXISTING_STACK_STATUSES, main, newStage, runExample, UsageError } from '../scripts/test-example.mjs';
import { runCheck } from '../scripts/lib/checks.mjs';
import { runCommand, stopAllCommands } from '../scripts/lib/exec.mjs';

const DIR = 'hello';
const STAGE_PATTERN = /^ex[a-z0-9]{9}$/;
const MINUTE = 60_000;

function manifest(overrides = {}) {
  return {
    title: 'Hello',
    description: 'A hello example.',
    language: 'node',
    platform: 'AWS',
    framework: 'v4',
    author: { name: 'Serverless, Inc.', link: 'https://github.com/serverless' },
    services: ['lambda'],
    test: { tier: 'fast', checks: [{ http: { output: 'HttpApiUrl', path: '/', status: 200, contains: 'Go Serverless' } }] },
    ...overrides,
  };
}

// Creates a repository root with one example at `hello`.
function fixture({ example = manifest(), files = {} } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'runner-test-'));
  const all = {
    'example.json': JSON.stringify(example, null, 2),
    'serverless.yml': "service: hello-svc\n\nframeworkVersion: '4'\n\nprovider:\n  name: aws\n",
    'handler.js': 'export const hello = async () => ({ statusCode: 200, body: "Go Serverless" });\n',
    'package.json': '{ "name": "hello", "private": true }\n',
    'package-lock.json': '{ "lockfileVersion": 3 }\n',
    'test/smoke.mjs': 'process.exit(0);\n',
    ...files,
  };
  for (const [rel, content] of Object.entries(all)) {
    if (content === null) continue;
    const file = path.join(root, DIR, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  return root;
}

function composeFixture(checks = [{ script: { path: 'test/smoke.mjs' } }]) {
  return fixture({
    example: manifest({ test: { tier: 'slow', checks } }),
    files: {
      'serverless.yml': null,
      'package.json': '{ "name": "root", "private": true }\n',
      'package-lock.json': null,
      'serverless-compose.yml': 'services:\n  api:\n    path: api\n  worker:\n    path: worker\n',
      'api/serverless.yml': "service: hello-api\nframeworkVersion: '4'\n",
      'api/package.json': '{ "name": "api", "private": true }\n',
      'api/package-lock.json': '{ "lockfileVersion": 3 }\n',
      'worker/serverless.yml': 'service: hello-worker\n',
    },
  });
}

const STACK_JSON = JSON.stringify({
  Stacks: [{ Outputs: [{ OutputKey: 'HttpApiUrl', OutputValue: 'https://abc.example.com' }, { OutputKey: 'TableName', OutputValue: 't1' }] }],
});

// Records every command. `responses` maps a step ("serverless deploy",
// "npm ci", "aws cloudformation") to a result object or a function returning one.
function fakeExec(responses = {}) {
  const calls = [];
  const exec = async (cmd, args, opts = {}) => {
    const step = `${cmd} ${args[0]}`;
    const call = { step, cmd, args, cwd: opts.cwd, env: opts.env, timeoutMs: opts.timeoutMs, signal: opts.signal };
    calls.push(call);
    const defaults = {
      'serverless --version': { status: 0, stdout: 'Serverless ϟ Framework 4.4.7\n', stderr: '' },
      'aws cloudformation': { status: 0, stdout: STACK_JSON, stderr: '' },
    };
    let r = responses[step] ?? defaults[step] ?? { status: 0, stdout: '', stderr: '' };
    if (typeof r === 'function') r = await r(call);
    return { stdout: '', stderr: '', ...r };
  };
  return { exec, calls, steps: () => calls.map((c) => c.step) };
}

// A clock that only moves when the code under test sleeps.
function fakeClock(start = Date.UTC(2026, 10, 19, 12)) {
  const clock = { t: start, sleeps: [] };
  clock.now = () => clock.t;
  clock.sleep = async (ms) => {
    clock.sleeps.push(ms);
    clock.t += ms;
  };
  return clock;
}

function response(status, body) {
  return { status, text: async () => body };
}

function fakeFetch(...replies) {
  const urls = [];
  const fetchImpl = async (url) => {
    urls.push(url);
    const r = replies.length > 1 ? replies.shift() : replies[0];
    if (r instanceof Error) throw r;
    return r;
  };
  return { fetchImpl, urls };
}

async function run(root, opts = {}) {
  const clock = opts.clock ?? fakeClock();
  const fx = opts.fx ?? fakeExec();
  const ff = opts.ff ?? fakeFetch(response(200, 'Go Serverless!'));
  const logs = [];
  const result = await runExample({
    root,
    dir: DIR,
    exec: fx.exec,
    fetchImpl: ff.fetchImpl,
    now: clock.now,
    sleep: clock.sleep,
    log: (line) => logs.push(line),
    env: {},
    ...opts.args,
  });
  return { result, fx, ff, clock, logs };
}

// --- stage

test('newStage is ex plus 9 lowercase base36 characters, at most 15 in total', () => {
  const stages = new Set();
  for (let i = 0; i < 200; i++) {
    const s = newStage();
    assert.match(s, STAGE_PATTERN);
    assert.ok(s.length <= 15);
    stages.add(s);
  }
  assert.ok(stages.size > 190, 'stages repeat');
});

// --- runExample: order and cleanup

test('happy path runs version, install, deploy, describe-stacks, remove in order and passes', async () => {
  const root = fixture();
  const { result, fx, ff } = await run(root);
  assert.deepEqual(fx.steps(), ['serverless --version', 'npm ci', 'serverless deploy', 'aws cloudformation', 'serverless remove']);
  assert.equal(result.result, 'pass');
  assert.equal(result.example, DIR);
  assert.equal(result.tier, 'fast');
  assert.equal(result.frameworkVersion, 'latest');
  assert.equal(result.resolvedVersion, '4.4.7');
  assert.match(result.stage, STAGE_PATTERN);
  assert.equal(result.startedAt, '2026-11-19T12:00:00.000Z');
  assert.equal(result.durationSeconds, 0);
  assert.equal(result.failedStep, undefined);
  assert.equal(result.leftBehind, undefined);

  const [, , deploy, describe, remove] = fx.calls;
  assert.equal(result.region, 'us-east-1');
  assert.deepEqual(deploy.args, ['deploy', '--stage', result.stage, '--region', 'us-east-1']);
  assert.deepEqual(describe.args, [
    'cloudformation',
    'describe-stacks',
    '--stack-name',
    `hello-svc-${result.stage}`,
    '--region',
    'us-east-1',
    '--output',
    'json',
  ]);
  assert.deepEqual(remove.args, ['remove', '--stage', result.stage, '--region', 'us-east-1']);
  assert.deepEqual(ff.urls, ['https://abc.example.com/']);
});

test('every command runs in a temporary copy that is deleted afterwards', async () => {
  const root = fixture();
  const { fx } = await run(root);
  const copy = fx.calls[0].cwd;
  assert.ok(!copy.startsWith(root), copy);
  assert.ok(fx.calls.every((c) => c.cwd === copy));
  assert.equal(fs.existsSync(copy), false);
});

test('the copy leaves out node_modules and .serverless', async () => {
  const root = fixture({ files: { 'node_modules/x/index.js': '', '.serverless/state.json': '{}' } });
  const seen = [];
  const fx = fakeExec({
    'npm ci': ({ cwd }) => {
      seen.push(fs.existsSync(path.join(cwd, 'node_modules')), fs.existsSync(path.join(cwd, '.serverless')));
      return { status: 0 };
    },
  });
  await run(root, { fx });
  assert.deepEqual(seen, [false, false]);
});

test('npm install runs when there is a package.json but no lockfile, and nothing without a package.json', async () => {
  const unlocked = await run(fixture({ files: { 'package-lock.json': null } }));
  assert.ok(unlocked.fx.steps().includes('npm install'));
  const bare = await run(fixture({ files: { 'package-lock.json': null, 'package.json': null } }));
  assert.ok(!bare.fx.steps().some((s) => s.startsWith('npm')));
  assert.equal(bare.result.result, 'pass');
});

test('the --region value goes to deploy, describe-stacks, remove and invoke', async () => {
  const root = fixture({
    example: manifest({ region: 'eu-west-1', test: { tier: 'fast', checks: [{ invoke: { function: 'hello', contains: 'ok' } }] } }),
  });
  const fx = fakeExec({ 'serverless invoke': { status: 0, stdout: 'ok' } });
  const { fx: flagged } = await run(root, { fx, args: { region: 'us-west-2' } });
  for (const c of flagged.calls.filter((c) => /deploy|cloudformation|remove|invoke/.test(c.step))) {
    assert.deepEqual(c.args.slice(c.args.indexOf('--region'), c.args.indexOf('--region') + 2), ['--region', 'us-west-2'], c.step);
  }
});

test("the manifest's region applies when --region is not given", async () => {
  const root = fixture({ example: manifest({ region: 'eu-west-1' }) });
  const { fx } = await run(root);
  const deploy = fx.calls.find((c) => c.step === 'serverless deploy');
  assert.deepEqual(deploy.args.slice(-2), ['--region', 'eu-west-1']);
});

// Returns the --region value of every serverless and aws call except serverless --version.
function regionsUsed(fx) {
  return fx.calls
    .filter((c) => (c.cmd === 'serverless' || c.cmd === 'aws') && c.args[0] !== '--version')
    .map((c) => (c.args.includes('--region') ? c.args[c.args.indexOf('--region') + 1] : null));
}

for (const [label, env, expected] of [
  ['AWS_REGION', { AWS_REGION: 'ap-south-1', AWS_DEFAULT_REGION: 'sa-east-1' }, 'ap-south-1'],
  ['AWS_DEFAULT_REGION', { AWS_DEFAULT_REGION: 'sa-east-1' }, 'sa-east-1'],
  ['us-east-1 by default', {}, 'us-east-1'],
]) {
  test(`without --region or a manifest region the region comes from ${label} and goes to every command`, async () => {
    const { fx, result } = await run(fixture(), { args: { env } });
    assert.equal(result.region, expected);
    const regions = regionsUsed(fx);
    assert.equal(regions.length, 3);
    assert.ok(regions.every((r) => r === expected), regions.join(', '));
  });
}

test('--region wins over the manifest and the environment', async () => {
  const root = fixture({ example: manifest({ region: 'eu-west-1' }) });
  const { fx, result } = await run(root, { args: { region: 'us-west-2', env: { AWS_REGION: 'ap-south-1' } } });
  assert.equal(result.region, 'us-west-2');
  assert.ok(regionsUsed(fx).every((r) => r === 'us-west-2'));
});

test("the manifest's region wins over the environment", async () => {
  const root = fixture({ example: manifest({ region: 'eu-west-1' }) });
  const { result } = await run(root, { args: { env: { AWS_REGION: 'ap-south-1' } } });
  assert.equal(result.region, 'eu-west-1');
});

// --- failures

test('removes after a failed check', async () => {
  const root = fixture();
  const { result, fx } = await run(root, { ff: fakeFetch(response(500, 'Internal Server Error')) });
  assert.equal(result.result, 'fail');
  assert.equal(result.failedStep, 'check');
  assert.match(result.detail, /checks\[0\] http: GET https:\/\/abc\.example\.com\/.*status 500/);
  assert.equal(fx.steps().at(-1), 'serverless remove');
  assert.equal(result.leftBehind, undefined);
});

test('removes after a failed deploy', async () => {
  const root = fixture();
  const { result, fx } = await run(root, { fx: fakeExec({ 'serverless deploy': { status: 1 } }) });
  assert.equal(result.result, 'fail');
  assert.equal(result.failedStep, 'deploy');
  assert.equal(result.detail, 'serverless deploy exited with code 1');
  assert.deepEqual(fx.steps().slice(-2), ['serverless deploy', 'serverless remove']);
});

test('a failed install deploys nothing and removes nothing', async () => {
  const root = fixture();
  const { result, fx } = await run(root, { fx: fakeExec({ 'npm ci': { status: 1 } }) });
  assert.equal(result.failedStep, 'install');
  assert.equal(result.detail, 'npm ci exited with code 1');
  assert.deepEqual(fx.steps(), ['serverless --version', 'npm ci']);
});

test('reports a stack left behind', async () => {
  const root = fixture();
  const { result } = await run(root, { fx: fakeExec({ 'serverless remove': { status: 1 } }) });
  assert.equal(result.result, 'fail');
  assert.equal(result.failedStep, 'remove');
  assert.equal(result.detail, 'serverless remove exited with code 1');
  assert.equal(result.leftBehind, `hello-svc-${result.stage}`);
});

test('a failed check followed by a failed remove keeps the check as the failed step and reports the stack', async () => {
  const root = fixture();
  const { result } = await run(root, {
    fx: fakeExec({ 'serverless remove': { status: 2 } }),
    ff: fakeFetch(response(404, 'Not Found')),
  });
  assert.equal(result.failedStep, 'check');
  assert.match(result.detail, /; remove: serverless remove exited with code 2$/);
  assert.equal(result.leftBehind, `hello-svc-${result.stage}`);
});

test('unreadable stack outputs fail the check step and still remove', async () => {
  const root = fixture();
  const { result, fx } = await run(root, { fx: fakeExec({ 'aws cloudformation': { status: 255, stderr: 'Stack does not exist' } }) });
  assert.equal(result.failedStep, 'check');
  assert.match(result.detail, /stack outputs of hello-svc-ex.*exited with code 255.*Stack does not exist/);
  assert.equal(fx.steps().at(-1), 'serverless remove');
});

test('a missing command is named in the detail', async () => {
  const root = fixture();
  const enoent = { status: null, error: Object.assign(new Error('spawn serverless ENOENT'), { code: 'ENOENT' }) };
  const { result } = await run(root, { fx: fakeExec({ 'serverless deploy': enoent }) });
  assert.equal(result.failedStep, 'deploy');
  assert.match(result.detail, /serverless command was not found on PATH/);
});

// --- deadline

test('a deploy that runs past the deadline is recorded as timed out and the stack is still removed', async () => {
  const root = fixture({ example: manifest({ test: { tier: 'fast', timeoutMinutes: 10, checks: manifest().test.checks } }) });
  const clock = fakeClock();
  const fx = fakeExec({ 'serverless deploy': () => ({ status: null, timedOut: true }) });
  const { result } = await run(root, { clock, fx });
  const deploy = fx.calls.find((c) => c.step === 'serverless deploy');
  const remove = fx.calls.find((c) => c.step === 'serverless remove');
  assert.equal(deploy.timeoutMs, 10 * MINUTE);
  assert.equal(remove.timeoutMs, 15 * MINUTE);
  assert.equal(result.failedStep, 'deploy');
  assert.equal(result.detail, 'timed out');
});

test('the deadline defaults to 15 minutes and is shared by the steps', async () => {
  const clock = fakeClock();
  const fx = fakeExec({
    'npm ci': () => {
      clock.t += 4 * MINUTE;
      return { status: 0 };
    },
  });
  await run(fixture(), { clock, fx });
  assert.equal(fx.calls.find((c) => c.step === 'serverless deploy').timeoutMs, 11 * MINUTE);
});

test('a check still retrying when the deadline passes is recorded as timed out', async () => {
  const root = fixture({ example: manifest({ test: { tier: 'fast', timeoutMinutes: 1, checks: manifest().test.checks } }) });
  const { result, fx } = await run(root, { ff: fakeFetch(response(503, 'Service Unavailable')) });
  assert.equal(result.failedStep, 'check');
  assert.equal(result.detail, 'timed out');
  assert.equal(fx.steps().at(-1), 'serverless remove');
});

test('a step that starts after the deadline does not run', async () => {
  const clock = fakeClock();
  const fx = fakeExec({
    'npm ci': () => {
      clock.t += 16 * MINUTE;
      return { status: 0 };
    },
  });
  const { result } = await run(fixture(), { clock, fx });
  assert.equal(result.failedStep, 'deploy');
  assert.equal(result.detail, 'timed out');
  assert.ok(!fx.steps().includes('serverless deploy'));
  assert.equal(fx.steps().at(-1), 'serverless remove');
  assert.equal(result.durationSeconds, 960);
});

// --- interruption

test('an interruption during deploy stops it, removes with its own deadline and records deploy as interrupted', async () => {
  const controller = new AbortController();
  const fx = fakeExec({
    'serverless deploy': () => {
      controller.abort();
      return { status: null, interrupted: true };
    },
  });
  const { result } = await run(fixture(), { fx, args: { signal: controller.signal } });
  assert.equal(result.result, 'fail');
  assert.equal(result.failedStep, 'deploy');
  assert.equal(result.detail, 'interrupted');
  assert.deepEqual(fx.steps(), ['serverless --version', 'npm ci', 'serverless deploy', 'serverless remove']);
  assert.equal(fx.calls[2].signal, controller.signal);
  const remove = fx.calls.at(-1);
  assert.notEqual(remove.signal, controller.signal);
  assert.equal(remove.timeoutMs, 15 * MINUTE);
  assert.equal(result.leftBehind, undefined);
});

test('a command that exits 0 after the interruption still counts as interrupted', async () => {
  const controller = new AbortController();
  const fx = fakeExec({
    'npm ci': () => {
      controller.abort();
      return { status: 0 };
    },
  });
  const { result } = await run(fixture(), { fx, args: { signal: controller.signal } });
  assert.equal(result.failedStep, 'install');
  assert.equal(result.detail, 'interrupted');
  assert.deepEqual(fx.steps(), ['serverless --version', 'npm ci']);
});

test('an interruption while an http check retries stops the check and removes', async () => {
  const controller = new AbortController();
  const ff = {
    fetchImpl: async () => {
      controller.abort();
      return response(503, 'Service Unavailable');
    },
  };
  const { result, fx, clock } = await run(fixture(), { ff, args: { signal: controller.signal } });
  assert.equal(result.failedStep, 'check');
  assert.equal(result.detail, 'interrupted');
  assert.deepEqual(clock.sleeps, []);
  assert.equal(fx.steps().at(-1), 'serverless remove');
});

test('an interruption during remove lets remove finish and records remove as interrupted', async () => {
  const controller = new AbortController();
  const fx = fakeExec({
    'serverless remove': () => {
      controller.abort();
      return { status: 0 };
    },
  });
  const { result } = await run(fixture(), { fx, args: { signal: controller.signal } });
  assert.equal(result.result, 'fail');
  assert.equal(result.failedStep, 'remove');
  assert.equal(result.detail, 'interrupted');
  assert.equal(result.leftBehind, undefined);
});

test('CLI: the first signal stops the step, removes, writes the result and exits 1', async () => {
  const root = fixture();
  const signals = new EventEmitter();
  const resultFile = path.join(root, 'r.json');
  const fx = fakeExec({
    'serverless deploy': () => {
      signals.emit('SIGINT');
      return { status: null, interrupted: true };
    },
  });
  const exits = [];
  const { code, out } = await cli([DIR, '--result-file', resultFile], root, { exec: fx.exec, signals, exit: (c) => exits.push(c) });
  assert.equal(code, 1);
  assert.deepEqual(exits, []);
  assert.match(out[0], /^FAIL hello /);
  assert.equal(fx.steps().at(-1), 'serverless remove');
  const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  assert.equal(result.failedStep, 'deploy');
  assert.equal(result.detail, 'interrupted');
  assert.equal(signals.listenerCount('SIGINT') + signals.listenerCount('SIGTERM'), 0);
});

test('CLI: a second signal during remove exits 1 at once and names the stack left behind', async () => {
  const root = fixture();
  const signals = new EventEmitter();
  let stage;
  const fx = fakeExec({
    'serverless deploy': ({ args }) => {
      stage = args[2];
      signals.emit('SIGTERM');
      return { status: null, interrupted: true };
    },
    'serverless remove': () => {
      signals.emit('SIGINT');
      return { status: 0 };
    },
  });
  const exits = [];
  const { err } = await cli([DIR], root, { exec: fx.exec, signals, exit: (c) => exits.push(c) });
  assert.deepEqual(exits, [1]);
  assert.ok(err.includes(`left behind: hello-svc-${stage}`), err.join('\n'));
});

// --- framework version

test('canary rewrites the copy and never the checkout', async () => {
  const root = fixture();
  const checkout = path.join(root, DIR, 'serverless.yml');
  const before = fs.readFileSync(checkout, 'utf8');
  let deployed;
  const fx = fakeExec({
    'serverless --version': { status: 0, stdout: 'Serverless ϟ Framework 4.30.1-canary.3\n' },
    'serverless deploy': ({ cwd }) => {
      deployed = fs.readFileSync(path.join(cwd, 'serverless.yml'), 'utf8');
      return { status: 0 };
    },
  });
  const { result } = await run(root, { fx, args: { frameworkVersion: 'canary' } });
  assert.match(deployed, /^frameworkVersion: 'canary'$/m);
  assert.doesNotMatch(deployed, /frameworkVersion: '4'/);
  assert.equal(fs.readFileSync(checkout, 'utf8'), before);
  assert.equal(result.frameworkVersion, 'canary');
  assert.equal(result.resolvedVersion, '4.30.1-canary.3');
});

test('a version number is written into the copy, and added when serverless.yml has no frameworkVersion', async () => {
  const root = fixture({ files: { 'serverless.yml': 'service: hello-svc\nprovider:\n  name: aws\n' } });
  let deployed;
  const fx = fakeExec({
    'serverless deploy': ({ cwd }) => {
      deployed = fs.readFileSync(path.join(cwd, 'serverless.yml'), 'utf8');
      return { status: 0 };
    },
  });
  await run(root, { fx, args: { frameworkVersion: '4.4.7' } });
  assert.match(deployed, /^frameworkVersion: '4\.4\.7'$/m);
  assert.match(deployed, /^service: hello-svc$/m);
});

test('latest leaves serverless.yml as it is', async () => {
  const root = fixture();
  let deployed;
  const fx = fakeExec({
    'serverless deploy': ({ cwd }) => {
      deployed = fs.readFileSync(path.join(cwd, 'serverless.yml'), 'utf8');
      return { status: 0 };
    },
  });
  await run(root, { fx });
  assert.equal(deployed, fs.readFileSync(path.join(root, DIR, 'serverless.yml'), 'utf8'));
});

test('the canary build id after Framework is the resolved version', async () => {
  const stdout = 'Using Canary release channel\n\n✔ Installed Serverless Framework v52f2ef5\n\nServerless ϟ Framework 52f2ef5\n';
  const { result } = await run(fixture(), { fx: fakeExec({ 'serverless --version': { status: 0, stdout } }), args: { frameworkVersion: 'canary' } });
  assert.equal(result.resolvedVersion, '52f2ef5');
  const { out } = await cli([DIR, '--framework-version', 'canary'], fixture(), { exec: fakeExec({ 'serverless --version': { status: 0, stdout } }).exec });
  assert.match(out[0], /^PASS hello 52f2ef5 /);
});

test('a released version after Framework is the resolved version', async () => {
  const { result } = await run(fixture(), { fx: fakeExec({ 'serverless --version': { status: 0, stdout: 'Serverless ϟ Framework 4.46.0\n' } }) });
  assert.equal(result.resolvedVersion, '4.46.0');
});

test('an unparseable or failing serverless --version gives resolvedVersion unknown and does not fail the run', async () => {
  for (const r of [{ status: 0, stdout: 'something else' }, { status: 1 }, { status: null, timedOut: true }]) {
    const { result } = await run(fixture(), { fx: fakeExec({ 'serverless --version': r }) });
    assert.equal(result.resolvedVersion, 'unknown');
    assert.equal(result.result, 'pass');
  }
});

test('a framework version that is not latest, canary or a version number is a usage error', async () => {
  await assert.rejects(run(fixture(), { args: { frameworkVersion: "4'; rm" } }), UsageError);
});

// --- manifests the runner refuses or skips

test('a quarantined example is skipped without running anything', async () => {
  const root = fixture({
    example: manifest({ test: { ...manifest().test, quarantine: { reason: 'Upstream outage', since: '2026-11-01' } } }),
  });
  const resultFile = path.join(root, 'out', 'result.json');
  const { result, fx } = await run(root, { args: { resultFile } });
  assert.deepEqual(fx.calls, []);
  assert.equal(result.result, 'skip');
  assert.equal(result.detail, 'quarantined: Upstream outage');
  assert.deepEqual(JSON.parse(fs.readFileSync(resultFile, 'utf8')), result);
});

test('a manifest without test is a usage error', async () => {
  const m = manifest();
  delete m.test;
  const fx = fakeExec();
  await assert.rejects(run(fixture({ example: m }), { fx }), (err) => err instanceof UsageError && /test/.test(err.message));
  assert.deepEqual(fx.calls, []);
});

test('an invalid manifest is a usage error', async () => {
  await assert.rejects(run(fixture({ example: manifest({ language: 'cobol' }) })), (err) => err instanceof UsageError && /language/.test(err.message));
});

test('a serverless.yml without a plain service name is a usage error before anything runs', async () => {
  const fx = fakeExec();
  await assert.rejects(run(fixture({ files: { 'serverless.yml': 'service: ${env:NAME}\n' } }), { fx }), UsageError);
  assert.deepEqual(fx.calls, []);
});

// --- result file

test('the result file holds the result as JSON', async () => {
  const root = fixture();
  const resultFile = path.join(root, 'results', 'hello.json');
  const { result } = await run(root, { fx: fakeExec({ 'serverless deploy': { status: 1 } }), args: { resultFile } });
  assert.deepEqual(JSON.parse(fs.readFileSync(resultFile, 'utf8')), result);
});

// An AccessDenied as AWS prints it, with an account id and a 13-digit timestamp.
// The id is built, so the source holds no 12-digit number but the placeholder.
const ACCOUNT = '4'.repeat(12);
const DENIED = `User: arn:aws:sts::${ACCOUNT}:assumed-role/examples-test/x is not authorized (request at 1763520000000)`;

test('account ids in the detail are masked in the result and the result file; a 13-digit number is left alone', async () => {
  const root = fixture();
  const resultFile = path.join(root, 'results', 'hello.json');
  const { result } = await run(root, { fx: fakeExec({ 'aws cloudformation': { status: 254, stderr: DENIED } }), args: { resultFile } });
  const written = fs.readFileSync(resultFile, 'utf8');
  assert.equal(result.failedStep, 'check');
  assert.ok(!written.includes(ACCOUNT), written);
  assert.ok(!result.detail.includes(ACCOUNT), result.detail);
  assert.ok(result.detail.includes('arn:aws:sts::123456789012:assumed-role/examples-test/x'), result.detail);
  assert.ok(result.detail.includes('1763520000000'), result.detail);
});

test('CLI: the failed-step line on stderr shows the masked detail', async () => {
  const { code, err } = await cli([DIR], fixture(), { exec: fakeExec({ 'aws cloudformation': { status: 254, stderr: DENIED } }).exec });
  assert.equal(code, 1);
  const line = err.find((l) => l.startsWith('failed step:'));
  assert.ok(line && line.includes('arn:aws:sts::123456789012:') && !line.includes(ACCOUNT), err.join('\n'));
});

// --- compose

test('a compose root installs in the root and each service with a package.json, deploys from the root and skips outputs', async () => {
  const root = composeFixture();
  const { result, fx } = await run(root);
  assert.equal(result.result, 'pass');
  assert.deepEqual(fx.steps(), ['serverless --version', 'npm install', 'npm ci', 'serverless deploy', 'node test/smoke.mjs', 'serverless remove']);
  const copy = fx.calls[0].cwd;
  assert.deepEqual(
    fx.calls.filter((c) => c.cmd === 'npm').map((c) => path.relative(copy, c.cwd)),
    ['', 'api'],
  );
  assert.equal(fx.calls.find((c) => c.step === 'serverless deploy').cwd, copy);
  assert.equal(fx.calls.find((c) => c.step === 'serverless remove').cwd, copy);
  const script = fx.calls.find((c) => c.cmd === 'node');
  assert.deepEqual(JSON.parse(script.env.EXAMPLE_OUTPUTS), {});
  assert.equal(script.env.EXAMPLE_REGION, 'us-east-1');
  assert.deepEqual(regionsUsed(fx), ['us-east-1', 'us-east-1']);
});

test('a compose root rewrites frameworkVersion in each service copy', async () => {
  const root = composeFixture();
  const seen = {};
  const fx = fakeExec({
    'serverless deploy': ({ cwd }) => {
      for (const s of ['api', 'worker']) seen[s] = fs.readFileSync(path.join(cwd, s, 'serverless.yml'), 'utf8');
      return { status: 0 };
    },
  });
  await run(root, { fx, args: { frameworkVersion: 'canary' } });
  assert.match(seen.api, /^frameworkVersion: 'canary'$/m);
  assert.match(seen.worker, /^frameworkVersion: 'canary'$/m);
});

// The installer picks the CLI from serverless-compose.yml for the whole Compose
// run; a service's frameworkVersion is only a range check.
test('a compose root writes frameworkVersion into serverless-compose.yml for the run and the remove', async () => {
  const root = composeFixture();
  const seen = [];
  const read = ({ cwd }) => {
    seen.push(fs.readFileSync(path.join(cwd, 'serverless-compose.yml'), 'utf8'));
    return { status: 0 };
  };
  await run(root, { fx: fakeExec({ 'serverless deploy': read }), args: { frameworkVersion: 'canary' } });
  assert.match(seen[0], /^frameworkVersion: 'canary'$/m);
  assert.match(seen[0], /^services:$/m);
  const fx = fakeExec({ 'aws cloudformation': stackList(['hello-api-exabc123def']), 'serverless remove': read });
  const { code } = await cli([DIR, '--remove-only', '--stage', 'exabc123def', '--framework-version', '4.4.7'], root, { exec: fx.exec, env: { AWS_REGION: 'eu-west-1' } });
  assert.equal(code, 0);
  assert.match(seen[1], /^frameworkVersion: '4\.4\.7'$/m);
});

test('a compose root with latest leaves serverless-compose.yml as it is', async () => {
  const root = composeFixture();
  let text;
  const fx = fakeExec({
    'serverless deploy': ({ cwd }) => {
      text = fs.readFileSync(path.join(cwd, 'serverless-compose.yml'), 'utf8');
      return { status: 0 };
    },
  });
  await run(root, { fx });
  assert.doesNotMatch(text, /frameworkVersion/);
});

test('a compose root reports each service stack left behind', async () => {
  const { result } = await run(composeFixture(), { fx: fakeExec({ 'serverless remove': { status: 1 } }) });
  assert.equal(result.failedStep, 'remove');
  assert.equal(result.leftBehind, `hello-api-${result.stage}, hello-worker-${result.stage}`);
});

test('a compose root with a check other than script is a usage error before deploying', async () => {
  const fx = fakeExec();
  await assert.rejects(
    run(composeFixture([{ http: { output: 'Url', status: 200 } }]), { fx }),
    (err) => err instanceof UsageError && /compose/i.test(err.message) && /script/.test(err.message),
  );
  assert.deepEqual(fx.calls, []);
});

// --- runCheck

function ctx(overrides = {}) {
  const clock = fakeClock();
  return {
    cwd: '/tmp/copy',
    stage: 'exabc123456',
    outputs: { HttpApiUrl: 'https://abc.example.com/' },
    exec: fakeExec().exec,
    fetchImpl: fakeFetch(response(200, 'ok')).fetchImpl,
    now: clock.now,
    sleep: clock.sleep,
    clock,
    ...overrides,
  };
}

test('http retry succeeds on the third attempt', async () => {
  const ff = fakeFetch(response(502, 'Bad Gateway'), new Error('connect ECONNREFUSED'), response(200, 'Go Serverless v4'));
  const c = ctx({ fetchImpl: ff.fetchImpl });
  await runCheck({ http: { output: 'HttpApiUrl', path: '/hello', status: 200, contains: 'Go Serverless' } }, c);
  assert.deepEqual(ff.urls, Array(3).fill('https://abc.example.com/hello'));
  assert.deepEqual(c.clock.sleeps, [5000, 5000]);
});

test('http timeout error includes the last status and the first 300 body characters', async () => {
  const body = 'x'.repeat(400);
  const ff = fakeFetch(response(503, body));
  const c = ctx({ fetchImpl: ff.fetchImpl });
  await assert.rejects(runCheck({ http: { output: 'HttpApiUrl', status: 200 } }, c), (err) => {
    assert.match(err.message, /status 503/);
    assert.ok(err.message.includes(`"${'x'.repeat(300)}"`));
    assert.ok(!err.message.includes('x'.repeat(301)));
    return true;
  });
  assert.equal(ff.urls.length, 19);
  assert.equal(c.clock.t - fakeClock().t, 90_000);
});

test('http requests the output as it is without a path, and joins a path with one slash', async () => {
  const ff = fakeFetch(response(200, 'ok'));
  const c = ctx({ fetchImpl: ff.fetchImpl, outputs: { A: 'https://a.example.com/dev/', B: 'https://b.example.com' } });
  await runCheck({ http: { output: 'A', status: 200 } }, c);
  await runCheck({ http: { output: 'A', path: '/items', status: 200 } }, c);
  await runCheck({ http: { output: 'B', path: '/items', status: 200 } }, c);
  assert.deepEqual(ff.urls, ['https://a.example.com/dev/', 'https://a.example.com/dev/items', 'https://b.example.com/items']);
});

test('http with only contains accepts any status whose body matches', async () => {
  await runCheck({ http: { output: 'HttpApiUrl', contains: 'denied' } }, ctx({ fetchImpl: fakeFetch(response(403, 'access denied')).fetchImpl }));
});

test('http names the outputs the stack has when the output is missing', async () => {
  await assert.rejects(runCheck({ http: { output: 'ApiUrl', status: 200 } }, ctx()), /stack output ApiUrl not found; the stack has HttpApiUrl/);
});

test('http that only ever gets request errors reports the last error', async () => {
  const c = ctx({ fetchImpl: fakeFetch(new Error('getaddrinfo ENOTFOUND')).fetchImpl });
  await assert.rejects(runCheck({ http: { output: 'HttpApiUrl', status: 200 } }, c), /request error: getaddrinfo ENOTFOUND/);
});

test('invoke builds the command with region, event and args and matches stdout plus stderr', async () => {
  const fx = fakeExec({ 'serverless invoke': { status: 0, stdout: '{"statusCode":200}', stderr: 'START RequestId hello world' } });
  await runCheck(
    { invoke: { function: 'hello', event: 'events/hello.json', args: ['--log'], contains: 'hello world' } },
    ctx({ exec: fx.exec, region: 'eu-central-1' }),
  );
  assert.deepEqual(fx.calls[0].args, ['invoke', '-f', 'hello', '--stage', 'exabc123456', '--region', 'eu-central-1', '--path', 'events/hello.json', '--log']);
  assert.equal(fx.calls[0].cwd, '/tmp/copy');
});

test('invoke output without the expected text is an error', async () => {
  const fx = fakeExec({ 'serverless invoke': { status: 0, stdout: 'nope' } });
  await assert.rejects(runCheck({ invoke: { function: 'hello', contains: 'yes' } }, ctx({ exec: fx.exec })), /does not contain "yes"/);
});

test('invoke that exits non-zero is an error', async () => {
  const fx = fakeExec({ 'serverless invoke': { status: 1, stdout: 'yes' } });
  await assert.rejects(runCheck({ invoke: { function: 'hello', contains: 'yes' } }, ctx({ exec: fx.exec })), /exited with code 1/);
});

test('script runs node with the outputs, stage, region and copy in its environment', async () => {
  const fx = fakeExec();
  await runCheck({ script: { path: 'test/smoke.mjs' } }, ctx({ exec: fx.exec, region: 'us-east-1' }));
  const { cmd, args, cwd, env } = fx.calls[0];
  assert.deepEqual([cmd, args, cwd], ['node', ['test/smoke.mjs'], '/tmp/copy']);
  assert.deepEqual(JSON.parse(env.EXAMPLE_OUTPUTS), { HttpApiUrl: 'https://abc.example.com/' });
  assert.equal(env.EXAMPLE_STAGE, 'exabc123456');
  assert.equal(env.EXAMPLE_REGION, 'us-east-1');
  assert.equal(env.EXAMPLE_DIR, '/tmp/copy');
  assert.equal(env.PATH, process.env.PATH);
});

test('script without a region leaves EXAMPLE_REGION unset, and a non-zero exit is an error', async () => {
  const fx = fakeExec({ 'node test/smoke.mjs': { status: 3 } });
  await assert.rejects(runCheck({ script: { path: 'test/smoke.mjs' } }, ctx({ exec: fx.exec })), /node test\/smoke\.mjs exited with code 3/);
  assert.equal('EXAMPLE_REGION' in fx.calls[0].env, false);
});

// --- runCommand (runs real local processes, no network)

test('runCommand captures output and streams it to stderr with the step prefix', async () => {
  const written = [];
  const r = await runCommand(process.execPath, ['-e', 'console.log("one\\ntwo"); console.error("three"); process.stdout.write("four")'], {
    step: 'deploy',
    write: (s) => written.push(s),
  });
  assert.equal(r.status, 0);
  assert.equal(r.stdout, 'one\ntwo\nfour');
  assert.equal(r.stderr, 'three\n');
  assert.deepEqual(written.sort(), ['[deploy] four\n', '[deploy] one\n', '[deploy] three\n', '[deploy] two\n']);
});

test('runCommand stops a command at its timeout', async () => {
  const r = await runCommand(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], { timeoutMs: 100, echo: false });
  assert.equal(r.timedOut, true);
  assert.equal(r.status, null);
});

test('runCommand stops a command when its signal aborts', async () => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 100);
  const r = await runCommand(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], { signal: controller.signal, echo: false });
  assert.equal(r.interrupted, true);
  assert.equal(r.status, null);
});

test('runCommand reports a missing command', async () => {
  const r = await runCommand('no-such-command-for-runner-tests', [], { echo: false });
  assert.equal(r.error?.code, 'ENOENT');
  assert.equal(r.status, null);
});

// --- CLI

async function cli(argv, root, deps = {}) {
  const out = [];
  const err = [];
  const clock = fakeClock();
  const code = await main(argv, {
    root,
    exec: fakeExec().exec,
    fetchImpl: fakeFetch(response(200, 'Go Serverless')).fetchImpl,
    now: clock.now,
    sleep: clock.sleep,
    out: (line) => out.push(line),
    err: (line) => err.push(line),
    env: {},
    // Only the test of the real second-signal path kills real process groups.
    stopCommands: () => {},
    ...deps,
  });
  return { code, out, err };
}

test('CLI prints one PASS line and exits 0', async () => {
  const { code, out } = await cli([`./${DIR}/`], fixture());
  assert.equal(code, 0);
  assert.deepEqual(out, [`PASS ${DIR} 4.4.7 0s`]);
});

test('CLI prints FAIL, names the failed step on stderr, and exits 1', async () => {
  const { code, out, err } = await cli([DIR], fixture(), { exec: fakeExec({ 'serverless remove': { status: 1 } }).exec });
  assert.equal(code, 1);
  // The fake cannot list stacks: after 3 failed listings, 10 s apart, remove fails.
  assert.deepEqual(out, [`FAIL ${DIR} 4.4.7 20s`]);
  assert.ok(err.some((l) => /remove/.test(l)));
  assert.ok(err.some((l) => /left behind: hello-svc-ex/.test(l)));
});

test('CLI prints SKIP for a quarantined example and exits 0', async () => {
  const root = fixture({ example: manifest({ test: { ...manifest().test, quarantine: { reason: 'Upstream outage', since: '2026-11-01' } } }) });
  const { code, out } = await cli([DIR], root);
  assert.equal(code, 0);
  assert.deepEqual(out, [`SKIP ${DIR} quarantined: Upstream outage`]);
});

test('CLI passes --framework-version, --region and --result-file through', async () => {
  const root = fixture();
  const fx = fakeExec();
  const resultFile = path.join(root, 'r.json');
  const { code } = await cli([DIR, '--framework-version', 'canary', '--region', 'eu-west-1', '--result-file', resultFile], root, { exec: fx.exec });
  assert.equal(code, 0);
  const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  assert.equal(result.frameworkVersion, 'canary');
  assert.deepEqual(fx.calls.find((c) => c.step === 'serverless deploy').args.slice(-2), ['--region', 'eu-west-1']);
});

test('CLI usage and manifest errors exit 2', async () => {
  const root = fixture();
  for (const argv of [[], [DIR, 'other'], [DIR, '--unknown'], ['missing-dir'], [DIR, '--framework-version', 'next']]) {
    const { code, out, err } = await cli(argv, root);
    assert.equal(code, 2, argv.join(' '));
    assert.deepEqual(out, []);
    assert.ok(err.length > 0);
  }
  const m = manifest();
  delete m.test;
  assert.equal((await cli([DIR], fixture({ example: m }))).code, 2);
});

// --- --stage

test('CLI: --stage is used instead of a generated stage', async () => {
  const root = fixture();
  const fx = fakeExec();
  const resultFile = path.join(root, 'r.json');
  const { code } = await cli([DIR, '--stage', 'exabc123def', '--result-file', resultFile], root, { exec: fx.exec });
  assert.equal(code, 0);
  assert.deepEqual(fx.calls.find((c) => c.step === 'serverless deploy').args.slice(0, 3), ['deploy', '--stage', 'exabc123def']);
  assert.deepEqual(fx.calls.find((c) => c.step === 'serverless remove').args.slice(0, 3), ['remove', '--stage', 'exabc123def']);
  assert.equal(JSON.parse(fs.readFileSync(resultFile, 'utf8')).stage, 'exabc123def');
});

test('CLI: a --stage that is not ex plus 1 to 13 lowercase base36 characters exits 2 before anything runs', async () => {
  const root = fixture();
  for (const stage of ['dev', 'ex', 'Exabc', 'exABC', 'ex-abc', `ex${'a'.repeat(14)}`, '']) {
    const fx = fakeExec();
    const { code, out } = await cli([DIR, '--stage', stage], root, { exec: fx.exec });
    assert.equal(code, 2, JSON.stringify(stage));
    assert.deepEqual(out, []);
    assert.deepEqual(fx.calls, []);
  }
  const fx = fakeExec();
  assert.equal((await cli([DIR, '--stage', `ex${'a'.repeat(13)}`], root, { exec: fx.exec })).code, 0);
});

// --- --remove-only

const STAGE = 'exabc123def';

function stackList(...names) {
  return { status: 0, stdout: JSON.stringify({ StackSummaries: names.map(([StackName, StackStatus = 'CREATE_COMPLETE']) => ({ StackName, StackStatus })) }) };
}

test('CLI: --remove-only needs --stage', async () => {
  const fx = fakeExec();
  const { code, err } = await cli([DIR, '--remove-only'], fixture(), { exec: fx.exec });
  assert.equal(code, 2);
  assert.ok(err.some((l) => /--stage/.test(l)), err.join('\n'));
  assert.deepEqual(fx.calls, []);
});

test('CLI: --remove-only looks for the stage, removes it and exits 0', async () => {
  const root = fixture();
  const resultFile = path.join(root, 'r.json');
  const fx = fakeExec({ 'aws cloudformation': stackList([`hello-svc-${STAGE}`], ['other-exzzz999zzz']) });
  const { code, out } = await cli([DIR, '--remove-only', '--stage', STAGE, '--result-file', resultFile], root, { exec: fx.exec, env: { AWS_REGION: 'eu-west-1' } });
  assert.equal(code, 0);
  assert.deepEqual(fx.steps(), ['aws cloudformation', 'serverless remove']);
  assert.deepEqual(fx.calls[0].args, [
    'cloudformation',
    'list-stacks',
    '--region',
    'eu-west-1',
    '--output',
    'json',
    '--stack-status-filter',
    ...EXISTING_STACK_STATUSES,
  ]);
  assert.equal(EXISTING_STACK_STATUSES.length, 22);
  assert.ok(!EXISTING_STACK_STATUSES.includes('DELETE_COMPLETE'));
  assert.deepEqual(fx.calls[1].args, ['remove', '--stage', STAGE, '--region', 'eu-west-1']);
  assert.equal(fx.calls[1].timeoutMs, 15 * MINUTE);
  assert.ok(!fx.calls[1].cwd.startsWith(root), 'remove runs in a copy');
  assert.match(out[0], /^PASS hello /);
  const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  assert.equal(result.stage, STAGE);
  assert.equal(result.result, 'pass');
});

test('CLI: --remove-only with nothing deployed for the stage runs no remove and exits 0', async () => {
  const root = fixture();
  const resultFile = path.join(root, 'r.json');
  const fx = fakeExec({ 'aws cloudformation': stackList([`hello-svc-${STAGE}`, 'DELETE_COMPLETE'], [`hello-svc-x${STAGE}`]) });
  const { code, out } = await cli([DIR, '--remove-only', '--stage', STAGE, '--result-file', resultFile], root, { exec: fx.exec });
  assert.equal(code, 0);
  assert.deepEqual(fx.steps(), ['aws cloudformation']);
  assert.match(out[0], /^PASS hello /);
  assert.equal(JSON.parse(fs.readFileSync(resultFile, 'utf8')).detail, 'nothing deployed');
});

test('CLI: --remove-only installs only where serverless.yml loads plugins', async () => {
  const root = fixture({ files: { 'serverless.yml': 'service: hello-svc\nplugins:\n  - serverless-wsgi\nprovider:\n  name: aws\n' } });
  const fx = fakeExec({ 'aws cloudformation': stackList([`hello-svc-${STAGE}`]) });
  const { code } = await cli([DIR, '--remove-only', '--stage', STAGE], root, { exec: fx.exec });
  assert.equal(code, 0);
  assert.deepEqual(fx.steps(), ['aws cloudformation', 'npm ci', 'serverless remove']);
});

test('CLI: --remove-only finds the stacks of a compose root by the stage suffix', async () => {
  const fx = fakeExec({ 'aws cloudformation': stackList([`shared-resources-${STAGE}`]) });
  const { code } = await cli([DIR, '--remove-only', '--stage', STAGE], composeFixture(), { exec: fx.exec });
  assert.equal(code, 0);
  assert.deepEqual(fx.steps(), ['aws cloudformation', 'serverless remove']);
});

test('CLI: --remove-only still removes when the stacks cannot be listed', async () => {
  const fx = fakeExec({ 'aws cloudformation': { status: 255, stderr: 'AccessDenied' } });
  const { code } = await cli([DIR, '--remove-only', '--stage', STAGE], fixture(), { exec: fx.exec });
  assert.equal(code, 0);
  assert.deepEqual(fx.steps(), ['aws cloudformation', 'serverless remove']);
});

test('CLI: --remove-only exits 1 and names the stacks when remove does not complete', async () => {
  const root = fixture();
  const resultFile = path.join(root, 'r.json');
  const fx = fakeExec({ 'aws cloudformation': stackList([`hello-svc-${STAGE}`]), 'serverless remove': { status: 1 } });
  const { code, out, err } = await cli([DIR, '--remove-only', '--stage', STAGE, '--result-file', resultFile], root, { exec: fx.exec });
  assert.equal(code, 1);
  assert.match(out[0], /^FAIL hello /);
  assert.ok(err.some((l) => l === `left behind: hello-svc-${STAGE}`), err.join('\n'));
  const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  assert.equal(result.failedStep, 'remove');
  assert.equal(result.leftBehind, `hello-svc-${STAGE}`);
});

// --- runCommand stops the whole process group

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

test('runCommand stops the grandchildren of a command, not only the command', async () => {
  // The child starts a grandchild that ignores its output pipes, prints its pid and waits.
  const child = `
    const { spawn } = require('node:child_process');
    const g = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], { stdio: 'ignore' });
    console.log(g.pid);
    setTimeout(() => {}, 60000);
  `;
  const r = await runCommand(process.execPath, ['-e', child], { timeoutMs: 500, echo: false });
  const grandchild = Number(r.stdout.trim());
  assert.ok(grandchild > 0, r.stdout);
  try {
    let waited = 0;
    while (alive(grandchild) && waited < 3000) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      waited += 50;
    }
    assert.equal(alive(grandchild), false, 'the grandchild is still running');
  } finally {
    if (alive(grandchild)) process.kill(grandchild, 'SIGKILL');
  }
});

// A command whose grandchild ignores SIGTERM and writes its pid to `pidFile`.
function stubbornGrandchild(pidFile) {
  return `
    const { spawn } = require('node:child_process');
    spawn(process.execPath, ['-e', ${JSON.stringify(
      "process.on('SIGTERM', () => {}); require('node:fs').writeFileSync(process.argv[1], String(process.pid)); setTimeout(() => {}, 60000);",
    )}, ${JSON.stringify(pidFile)}], { stdio: 'ignore' });
    setTimeout(() => {}, 60000);
  `;
}

async function waitFor(check, ms = 5000) {
  for (let waited = 0; waited < ms && !check(); waited += 25) await new Promise((resolve) => setTimeout(resolve, 25));
  return check();
}

test('stopAllCommands kills the process group of every running command', async () => {
  const pidFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'runner-test-')), 'pid');
  const running = runCommand(process.execPath, ['-e', stubbornGrandchild(pidFile)], { echo: false });
  assert.ok(await waitFor(() => fs.existsSync(pidFile) && fs.readFileSync(pidFile, 'utf8')), 'the grandchild did not start');
  const grandchild = Number(fs.readFileSync(pidFile, 'utf8'));
  try {
    stopAllCommands('SIGKILL');
    const r = await running;
    assert.equal(r.status, null);
    assert.ok(await waitFor(() => !alive(grandchild), 3000), 'the grandchild is still running');
  } finally {
    if (alive(grandchild)) process.kill(grandchild, 'SIGKILL');
  }
});

test('CLI: a second signal kills the running command group, grandchildren included, before exiting', async () => {
  const root = fixture();
  const signals = new EventEmitter();
  const pidFile = path.join(root, 'pid');
  let grandchild;
  const exits = [];
  const fx = fakeExec({
    'serverless deploy': async ({ signal }) => {
      const running = runCommand(process.execPath, ['-e', stubbornGrandchild(pidFile)], { echo: false, signal });
      assert.ok(await waitFor(() => fs.existsSync(pidFile) && fs.readFileSync(pidFile, 'utf8')), 'the grandchild did not start');
      grandchild = Number(fs.readFileSync(pidFile, 'utf8'));
      // GitHub cancels a job with SIGINT, then SIGTERM.
      signals.emit('SIGINT');
      signals.emit('SIGTERM');
      return running;
    },
  });
  try {
    await cli([DIR], root, { exec: fx.exec, signals, exit: (c) => exits.push(c), stopCommands: stopAllCommands });
    assert.deepEqual(exits, [1]);
    assert.ok(await waitFor(() => !alive(grandchild), 3000), 'the grandchild is still running');
  } finally {
    if (grandchild && alive(grandchild)) process.kill(grandchild, 'SIGKILL');
  }
});

// --- remove: the outcome comes from the stage's stacks

const REMOVE_ERROR = '✖ ServerlessError2: An error occurred: IamRoleLambdaExecution - Resource creation cancelled.';

// Answers `aws cloudformation`: describe-stacks with the outputs, list-stacks
// with the next of `lists` (the last one repeats). Each list is [[name, status], …],
// or a command result (an object) for a listing that does not succeed.
function cfn(...lists) {
  const seen = [];
  const respond = ({ args }) => {
    if (args[1] !== 'list-stacks') return { status: 0, stdout: STACK_JSON };
    const rows = lists.length > 1 ? lists.shift() : lists[0];
    seen.push(rows);
    return Array.isArray(rows) ? stackList(...rows) : rows;
  };
  return { respond, seen };
}

// `serverless remove` answers in turn (the last one repeats).
function removes(...answers) {
  return () => (answers.length > 1 ? answers.shift() : answers[0]);
}

// The live run's output: the error line, then the CLI's help footer.
const REMOVE_OUTPUT = `\n${REMOVE_ERROR}\n\nFor help, try the following:\n  • Run the command again with the "--debug" option\n  • Review the docs: https://www.serverless.com/framework/docs/\n`;
const removeFailed = { status: 1, stdout: 'Removing aws-node from stage\n', stderr: REMOVE_OUTPUT };
const removeCount = (fx) => fx.steps().filter((s) => s === 'serverless remove').length;

test('remove-only: a remove that exits 1 while the stack is being deleted passes once the stack is gone', async () => {
  const root = fixture();
  const resultFile = path.join(root, 'r.json');
  const stack = `hello-svc-${STAGE}`;
  const listing = cfn([[stack, 'CREATE_IN_PROGRESS']], [[stack, 'DELETE_IN_PROGRESS']], [[stack, 'DELETE_IN_PROGRESS']], []);
  const fx = fakeExec({ 'aws cloudformation': listing.respond, 'serverless remove': removes(removeFailed) });
  const clock = fakeClock();
  const { code, out, err } = await cli([DIR, '--remove-only', '--stage', STAGE, '--result-file', resultFile], root, {
    exec: fx.exec,
    now: clock.now,
    sleep: clock.sleep,
  });
  assert.equal(code, 0, err.join('\n'));
  assert.match(out[0], /^PASS hello /);
  assert.equal(removeCount(fx), 1);
  assert.deepEqual(clock.sleeps, [10_000, 10_000]);
  const result = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
  assert.equal(result.result, 'pass');
  assert.equal(result.failedStep, undefined);
  assert.equal(result.leftBehind, undefined);
  assert.match(result.detail, /gone/);
  assert.ok(
    result.detail.endsWith('serverless remove had reported an error: ServerlessError2: An error occurred: IamRoleLambdaExecution - Resource creation cancelled.'),
    result.detail,
  );
  assert.ok(err.some((l) => /^\[remove\] waiting for .*DELETE_IN_PROGRESS/.test(l)), err.join('\n'));
});

test('a normal run is not failed by a remove that exits 1 when the stack is deleted after it', async () => {
  const stack = `hello-svc-${STAGE}`;
  const listing = cfn([[stack, 'DELETE_IN_PROGRESS']], []);
  const fx = fakeExec({ 'aws cloudformation': listing.respond, 'serverless remove': removes(removeFailed) });
  const { result } = await run(fixture(), { fx, args: { stage: STAGE } });
  assert.equal(result.result, 'pass');
  assert.equal(result.failedStep, undefined);
  assert.equal(result.leftBehind, undefined);
});

test('a stack that settles in a state that is not deleting gets one more serverless remove', async () => {
  const stack = `hello-svc-${STAGE}`;
  const listing = cfn([[stack, 'CREATE_IN_PROGRESS']], [[stack, 'CREATE_COMPLETE']], [[stack, 'DELETE_IN_PROGRESS']], []);
  const fx = fakeExec({ 'aws cloudformation': listing.respond, 'serverless remove': removes(removeFailed, { status: 0 }) });
  const { result } = await run(fixture(), { fx, args: { stage: STAGE } });
  assert.equal(removeCount(fx), 2);
  assert.equal(result.result, 'pass');
});

test('when the retry leaves the stack too, remove fails and names only that stack', async () => {
  const stack = `hello-svc-${STAGE}`;
  const listing = cfn([[stack, 'ROLLBACK_COMPLETE']]);
  const fx = fakeExec({ 'aws cloudformation': listing.respond, 'serverless remove': removes(removeFailed) });
  const clock = fakeClock();
  const { result } = await run(fixture(), { fx, clock, args: { stage: STAGE } });
  assert.equal(removeCount(fx), 2, 'one retry in total');
  assert.equal(result.result, 'fail');
  assert.equal(result.failedStep, 'remove');
  assert.equal(result.leftBehind, stack);
  assert.deepEqual(clock.sleeps, [], 'nothing can change a settled stack once the retry is spent');
});

test('of two expected stacks, leftBehind names only the one that still exists', async () => {
  const listing = cfn([[`hello-worker-${STAGE}`, 'DELETE_FAILED']]);
  const fx = fakeExec({ 'aws cloudformation': listing.respond, 'serverless remove': removes(removeFailed) });
  const { result } = await run(composeFixture(), { fx, args: { stage: STAGE } });
  assert.equal(result.failedStep, 'remove');
  assert.equal(result.leftBehind, `hello-worker-${STAGE}`);
});

test('the wait for a deleting stack stops after 10 minutes', async () => {
  const stack = `hello-svc-${STAGE}`;
  const fx = fakeExec({ 'aws cloudformation': cfn([[stack, 'DELETE_IN_PROGRESS']]).respond, 'serverless remove': removes(removeFailed) });
  const clock = fakeClock();
  const { result } = await run(fixture(), { fx, clock, args: { stage: STAGE } });
  assert.equal(clock.sleeps.reduce((a, b) => a + b, 0), 10 * MINUTE);
  assert.ok(clock.sleeps.every((ms) => ms <= 10_000));
  assert.equal(removeCount(fx), 1, 'a deleting stack is not removed again');
  assert.equal(result.failedStep, 'remove');
  assert.equal(result.leftBehind, stack);
});

test("the wait never runs past the remove step's own deadline", async () => {
  const stack = `hello-svc-${STAGE}`;
  const clock = fakeClock();
  const fx = fakeExec({
    'aws cloudformation': cfn([[stack, 'DELETE_IN_PROGRESS']]).respond,
    'serverless remove': () => {
      clock.t += 12 * MINUTE;
      return removeFailed;
    },
  });
  const { result } = await run(fixture(), { fx, clock, args: { stage: STAGE } });
  assert.equal(clock.sleeps.reduce((a, b) => a + b, 0), 3 * MINUTE);
  assert.equal(result.failedStep, 'remove');
});

test('a remove error without a ✖ line is quoted by its last non-empty line', async () => {
  const root = fixture();
  const resultFile = path.join(root, 'r.json');
  const stack = `hello-svc-${STAGE}`;
  const fx = fakeExec({
    'aws cloudformation': cfn([[stack, 'CREATE_COMPLETE']], []).respond,
    'serverless remove': removes({ status: 1, stderr: 'Error: something odd\n  at the end  \n\n' }),
  });
  const { code } = await cli([DIR, '--remove-only', '--stage', STAGE, '--result-file', resultFile], root, { exec: fx.exec });
  assert.equal(code, 0);
  assert.ok(JSON.parse(fs.readFileSync(resultFile, 'utf8')).detail.endsWith('had reported an error: at the end'));
});

test('remove-only: account ids in the detail and the stacks left behind are masked in the result file', async () => {
  for (const [name, removeAnswer, list] of [
    // The stacks are gone; the detail quotes the remove error.
    ['gone', { status: 1, stderr: `✖ ${DENIED}\n` }, cfn([[`hello-svc-${STAGE}`, 'CREATE_COMPLETE']], [])],
    // Remove does not complete; the detail is the error and leftBehind names the stacks.
    ['left', { status: 1, stderr: `✖ ${DENIED}\n` }, cfn([[`hello-svc-${STAGE}`, 'CREATE_COMPLETE']], [[`app-${ACCOUNT}-${STAGE}`, 'DELETE_FAILED']])],
  ]) {
    const root = fixture();
    const resultFile = path.join(root, 'r.json');
    const fx = fakeExec({ 'aws cloudformation': list.respond, 'serverless remove': removes(removeAnswer) });
    await cli([DIR, '--remove-only', '--stage', STAGE, '--result-file', resultFile], root, { exec: fx.exec });
    const written = fs.readFileSync(resultFile, 'utf8');
    const result = JSON.parse(written);
    assert.ok(!written.includes(ACCOUNT), `${name}: ${written}`);
    if (name === 'gone') assert.ok(result.detail.includes('arn:aws:sts::123456789012:') && result.detail.includes('1763520000000'), result.detail);
    if (name === 'left') assert.equal(result.leftBehind, `app-123456789012-${STAGE}`);
  }
});

test("a listing in the wait never gets more time than is left to remove's deadline", async () => {
  const stack = `hello-svc-${STAGE}`;
  const clock = fakeClock();
  const fx = fakeExec({
    'aws cloudformation': cfn([[stack, 'DELETE_IN_PROGRESS']], []).respond,
    'serverless remove': () => {
      clock.t += 14.5 * MINUTE;
      return removeFailed;
    },
  });
  await run(fixture(), { fx, clock, args: { stage: STAGE } });
  const removeAt = fx.calls.findIndex((c) => c.step === 'serverless remove');
  const listings = fx.calls.slice(removeAt).filter((c) => c.args[1] === 'list-stacks');
  assert.ok(listings.length >= 1);
  assert.equal(listings[0].timeoutMs, 30_000);
  assert.ok(listings.every((c) => c.timeoutMs <= 30_000), listings.map((c) => c.timeoutMs).join(', '));
});

const LISTING_ERROR = {
  status: 254,
  stderr: '\nAn error occurred (ExpiredToken) when calling the ListStacks operation: The security token included in the request is expired for 123456789012\n',
};

test('three failed listings in a row stop the wait: remove fails with the expected names and the reason is logged', async () => {
  const clock = fakeClock();
  const fx = fakeExec({ 'aws cloudformation': cfn(LISTING_ERROR).respond, 'serverless remove': removes(removeFailed) });
  const { result, logs } = await run(fixture(), { fx, clock, args: { stage: STAGE } });
  assert.equal(fx.calls.filter((c) => c.args[1] === 'list-stacks').length, 3);
  assert.deepEqual(clock.sleeps, [10_000, 10_000]);
  assert.equal(result.failedStep, 'remove');
  assert.equal(result.leftBehind, `hello-svc-${STAGE}`);
  const reason = logs.find((l) => /^\[remove\] .*ExpiredToken/.test(l));
  assert.ok(reason, logs.join('\n'));
  assert.doesNotMatch(reason, /123456789012/);
});

test('a successful listing resets the count of failed ones', async () => {
  const stack = `hello-svc-${STAGE}`;
  const listing = cfn(LISTING_ERROR, LISTING_ERROR, [[stack, 'DELETE_IN_PROGRESS']], LISTING_ERROR, LISTING_ERROR, []);
  const fx = fakeExec({ 'aws cloudformation': listing.respond, 'serverless remove': removes(removeFailed) });
  const { result } = await run(fixture(), { fx, args: { stage: STAGE } });
  assert.equal(fx.calls.filter((c) => c.args[1] === 'list-stacks').length, 6);
  assert.equal(result.result, 'pass');
});

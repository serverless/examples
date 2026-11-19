import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { findExampleDirs, loadManifest, validateManifest } from '../scripts/lib/manifest.mjs';

function validManifest() {
  return {
    dir: 'aws-node-http-api',
    title: 'HTTP API on AWS Lambda (Node.js)',
    description: 'A single HTTP endpoint on API Gateway and Lambda.',
    language: 'node',
    platform: 'AWS',
    framework: 'v4',
    author: { name: 'Serverless, Inc.', link: 'https://github.com/serverless', avatar: 'https://example.com/a.png' },
    services: ['lambda', 'apigateway'],
    test: {
      tier: 'fast',
      checks: [{ http: { output: 'HttpApiUrl', path: '/', status: 200, contains: 'Go Serverless' } }],
      timeoutMinutes: 10,
    },
  };
}

function errorsContaining(errors, text) {
  return errors.filter((e) => e.includes(text));
}

test('a valid manifest has no errors', () => {
  assert.deepEqual(validateManifest(validManifest()), []);
});

test('a manifest without test, region, priority or onboarding is valid', () => {
  const m = validManifest();
  delete m.test;
  delete m.author.avatar;
  assert.deepEqual(validateManifest(m), []);
});

test('optional fields with the right types are valid', () => {
  const m = validManifest();
  m.region = 'us-east-1';
  m.priority = 3;
  m.onboarding = true;
  m.test.checks.push(
    { invoke: { function: 'hello', event: 'events/hello.json', contains: 'ok' } },
    { script: { path: 'test/smoke.mjs' } },
  );
  m.test.quarantine = { reason: 'Upstream API rate limits', since: '2026-11-01' };
  assert.deepEqual(validateManifest(m), []);
});

test('a missing title is reported by name', () => {
  const m = validManifest();
  delete m.title;
  const errors = validateManifest(m);
  assert.equal(errorsContaining(errors, 'title').length, 1, errors.join('\n'));
});

test('missing required fields are each reported', () => {
  const errors = validateManifest({ dir: 'x' });
  for (const field of ['title', 'description', 'language', 'platform', 'framework', 'author', 'services']) {
    assert.ok(errorsContaining(errors, field).length > 0, `${field} not reported:\n${errors.join('\n')}`);
  }
});

test('an unknown language lists the allowed values', () => {
  const m = validManifest();
  m.language = 'nodeJS';
  const errors = validateManifest(m);
  assert.equal(errors.length, 1, errors.join('\n'));
  assert.match(errors[0], /language/);
  for (const lang of ['node', 'python', 'go', 'java', 'ruby', 'csharp', 'rust']) {
    assert.ok(errors[0].includes(lang), `${lang} missing from: ${errors[0]}`);
  }
});

test('a platform other than AWS is an error', () => {
  const m = validManifest();
  m.platform = 'aws';
  assert.equal(errorsContaining(validateManifest(m), 'platform').length, 1);
});

test('a framework other than v4 is an error', () => {
  const m = validManifest();
  m.framework = 'v3';
  const errors = validateManifest(m);
  assert.equal(errors.length, 1, errors.join('\n'));
  assert.match(errors[0], /framework/);
});

test('author name and link are required, avatar is optional', () => {
  const m = validManifest();
  m.author = { avatar: 'https://example.com/a.png' };
  const errors = validateManifest(m);
  assert.equal(errorsContaining(errors, 'author.name').length, 1, errors.join('\n'));
  assert.equal(errorsContaining(errors, 'author.link').length, 1, errors.join('\n'));
});

test('services must be an array of strings', () => {
  const m = validManifest();
  m.services = 'lambda';
  assert.equal(errorsContaining(validateManifest(m), 'services').length, 1);
  m.services = ['lambda', 3];
  assert.equal(errorsContaining(validateManifest(m), 'services').length, 1);
});

test('services must not be empty', () => {
  const m = validManifest();
  m.services = [];
  assert.equal(errorsContaining(validateManifest(m), 'services').length, 1);
});

test('unknown keys are errors naming the key and its path, at every level', () => {
  const cases = [
    [(m) => { m.titel = 'x'; }, 'titel'],
    [(m) => { m.author.email = 'x'; }, 'author.email'],
    [(m) => { m.test.timeoutMinute = 10; }, 'test.timeoutMinute'],
    [(m) => { m.test.quarantine = { reason: 'r', since: '2026-11-01', until: '2026-12-01' }; }, 'test.quarantine.until'],
    [(m) => { m.test.checks[0].http.statusCode = 200; }, 'test.checks[0].http.statusCode'],
    [(m) => { m.test.checks = [{ invoke: { function: 'f', contains: 'ok', payload: '{}' } }]; }, 'test.checks[0].invoke.payload'],
    [(m) => { m.test.checks = [{ script: { path: 'test/smoke.mjs', args: [] } }]; }, 'test.checks[0].script.args'],
  ];
  for (const [mutate, keyPath] of cases) {
    const m = validManifest();
    mutate(m);
    const errors = validateManifest(m);
    assert.equal(errors.length, 1, `${keyPath}: ${errors.join('\n')}`);
    assert.ok(errors[0].includes(keyPath), `${keyPath} not named in: ${errors[0]}`);
    assert.match(errors[0], /unknown key/);
  }
});

test('optional fields with the wrong type are errors', () => {
  const m = validManifest();
  m.onboarding = 'yes';
  m.priority = '1';
  m.region = 42;
  const errors = validateManifest(m);
  assert.equal(errors.length, 3, errors.join('\n'));
  assert.equal(errorsContaining(errors, 'onboarding').length, 1);
  assert.equal(errorsContaining(errors, 'priority').length, 1);
  assert.equal(errorsContaining(errors, 'region').length, 1);
});

test('a tier other than fast or slow is an error', () => {
  const m = validManifest();
  m.test.tier = 'medium';
  const errors = validateManifest(m);
  assert.equal(errors.length, 1, errors.join('\n'));
  assert.match(errors[0], /test\.tier/);
});

test('a test without checks is an error', () => {
  const m = validManifest();
  m.test.checks = [];
  assert.equal(errorsContaining(validateManifest(m), 'test.checks').length, 1);
});

test('timeoutMinutes must be a positive number', () => {
  const m = validManifest();
  m.test.timeoutMinutes = 0;
  assert.equal(errorsContaining(validateManifest(m), 'timeoutMinutes').length, 1);
});

test('an http check with neither status nor contains has no assertion', () => {
  const m = validManifest();
  m.test.checks = [{ http: { output: 'HttpApiUrl', path: '/' } }];
  const errors = validateManifest(m);
  assert.equal(errors.length, 1, errors.join('\n'));
  assert.match(errors[0], /no assertion/);
});

test('an http check with only status or only contains is valid', () => {
  const m = validManifest();
  m.test.checks = [{ http: { output: 'HttpApiUrl', status: 200 } }, { http: { output: 'HttpApiUrl', contains: 'ok' } }];
  assert.deepEqual(validateManifest(m), []);
});

test('an http check needs an output', () => {
  const m = validManifest();
  m.test.checks = [{ http: { status: 200 } }];
  assert.equal(errorsContaining(validateManifest(m), 'output').length, 1);
});

test('an invoke check without contains is an error', () => {
  const m = validManifest();
  m.test.checks = [{ invoke: { function: 'hello' } }];
  const errors = validateManifest(m);
  assert.equal(errors.length, 1, errors.join('\n'));
  assert.match(errors[0], /contains/);
});

test('an invoke check accepts extra CLI arguments in args', () => {
  const m = validManifest();
  m.test.checks = [{ invoke: { function: 'hello', args: ['--type', 'Event'], contains: 'ok' } }];
  assert.deepEqual(validateManifest(m), []);
});

for (const [label, args] of [
  ['a string', '--log'],
  ['an empty string', ['']],
  ['a number', [1]],
]) {
  test(`invoke args as ${label} is an error`, () => {
    const m = validManifest();
    m.test.checks = [{ invoke: { function: 'hello', args, contains: 'ok' } }];
    const errors = validateManifest(m);
    assert.equal(errors.length, 1, errors.join('\n'));
    assert.match(errors[0], /test\.checks\[0\]\.invoke\.args/);
  });
}

test('a script check needs a path', () => {
  const m = validManifest();
  m.test.checks = [{ script: {} }];
  assert.equal(errorsContaining(validateManifest(m), 'path').length, 1);
});

test('a check with two kinds is an error', () => {
  const m = validManifest();
  m.test.checks = [{ http: { output: 'HttpApiUrl', status: 200 }, script: { path: 'test/smoke.mjs' } }];
  const errors = validateManifest(m);
  assert.equal(errors.length, 1, errors.join('\n'));
  assert.match(errors[0], /test\.checks\[0\]/);
});

test('a check with no known kind is an error', () => {
  const m = validManifest();
  m.test.checks = [{ curl: { url: 'https://example.com' } }];
  assert.equal(errorsContaining(validateManifest(m), 'test.checks[0]').length, 1);
});

test('quarantine needs since as YYYY-MM-DD', () => {
  for (const since of [undefined, '19/11/2026', '2026-11-1', '2026-13-01']) {
    const m = validManifest();
    m.test.quarantine = { reason: 'Upstream outage' };
    if (since !== undefined) m.test.quarantine.since = since;
    const errors = validateManifest(m);
    assert.equal(errors.length, 1, `since=${since}: ${errors.join('\n')}`);
    assert.match(errors[0], /quarantine\.since/);
  }
});

test('quarantine needs a reason', () => {
  const m = validManifest();
  m.test.quarantine = { since: '2026-11-01' };
  assert.equal(errorsContaining(validateManifest(m), 'quarantine.reason').length, 1);
});

test('a description containing ": " is accepted', () => {
  const m = validManifest();
  m.description = 'Two parts: an API and a worker.';
  assert.deepEqual(validateManifest(m), []);
});

function makeTree(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-test-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return root;
}

test('findExampleDirs returns repo-relative dirs with example.json, sorted, skipping dot-directories', () => {
  const root = makeTree({
    'b-example/example.json': '{}',
    'a-example/example.json': '{}',
    'a-example/nested/example.json': '{}',
    'group/inner-example/example.json': '{}',
    'unmigrated/serverless.yml': 'service: x',
    'node_modules/pkg/example.json': '{}',
    '.git/example.json': '{}',
    '.github/x/example.json': '{}',
    '.serverless/example.json': '{}',
    '.tool-state/x/example.json': '{}',
    'group/.work/example.json': '{}',
    'tests/fixture/example.json': '{}',
    'scripts/fixture/example.json': '{}',
  });
  try {
    assert.deepEqual(findExampleDirs(root), ['a-example', 'b-example', 'group/inner-example']);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('loadManifest returns the parsed manifest with its dir', () => {
  const m = validManifest();
  delete m.dir;
  const root = makeTree({ 'group/my-example/example.json': JSON.stringify(m) });
  try {
    const loaded = loadManifest(root, 'group/my-example');
    assert.deepEqual(loaded, { ...m, dir: 'group/my-example' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('loadManifest names the file when the JSON is invalid', () => {
  const root = makeTree({ 'bad/example.json': '{ "title": ' });
  try {
    assert.throws(() => loadManifest(root, 'bad'), /bad[\\/]example\.json/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

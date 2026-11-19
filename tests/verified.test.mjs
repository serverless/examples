import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { badgePath, mergeResults, renderBadge } from '../scripts/lib/verified.mjs';
import { run } from '../scripts/publish-verified.mjs';

const RUN_1 = 'https://github.com/serverless/examples/actions/runs/1';
const RUN_2 = 'https://github.com/serverless/examples/actions/runs/2';
const RUN_3 = 'https://github.com/serverless/examples/actions/runs/3';

function result(overrides = {}) {
  return {
    example: 'aws-node',
    tier: 'fast',
    result: 'pass',
    frameworkVersion: 'latest',
    resolvedVersion: '4.30.1',
    stage: 'exabc123def',
    region: 'us-east-1',
    startedAt: '2026-11-19T03:20:00.000Z',
    durationSeconds: 95,
    ...overrides,
  };
}

// --- mergeResults

test('a first passing run sets verified', () => {
  const merged = mergeResults({}, [result()], RUN_1);
  assert.deepEqual(merged, {
    'aws-node': {
      runs: [{ result: 'pass', date: '2026-11-19', frameworkVersion: '4.30.1', runUrl: RUN_1 }],
      verified: { date: '2026-11-19', frameworkVersion: '4.30.1', runUrl: RUN_1 },
    },
  });
});

test('one non-passing run after a pass keeps verified at the pass', () => {
  const first = mergeResults({}, [result()], RUN_1);
  const second = mergeResults(first, [result({ result: 'fail', failedStep: 'check', startedAt: '2026-11-20T03:20:00.000Z', resolvedVersion: '4.30.2' })], RUN_2);
  assert.deepEqual(
    second['aws-node'].runs.map((r) => [r.result, r.date]),
    [
      ['fail', '2026-11-20'],
      ['pass', '2026-11-19'],
    ],
  );
  assert.deepEqual(second['aws-node'].verified, { date: '2026-11-19', frameworkVersion: '4.30.1', runUrl: RUN_1 });
});

test('two non-passing runs clear verified, and only two runs are kept', () => {
  const first = mergeResults({}, [result()], RUN_1);
  const second = mergeResults(first, [result({ result: 'fail', startedAt: '2026-11-20T03:20:00.000Z' })], RUN_2);
  const third = mergeResults(second, [result({ result: 'fail', startedAt: '2026-11-21T03:20:00.000Z' })], RUN_3);
  assert.equal(third['aws-node'].runs.length, 2);
  assert.deepEqual(
    third['aws-node'].runs.map((r) => r.runUrl),
    [RUN_3, RUN_2],
  );
  assert.equal(third['aws-node'].verified, null);
});

test('a pass after two non-passes sets verified again', () => {
  const failed = mergeResults({}, [result({ result: 'fail' }), result({ result: 'fail', startedAt: '2026-11-18T03:20:00.000Z' })], RUN_1);
  assert.equal(failed['aws-node'].verified, null);
  const passed = mergeResults(failed, [result({ startedAt: '2026-11-22T03:20:00.000Z' })], RUN_2);
  assert.deepEqual(passed['aws-node'].verified, { date: '2026-11-22', frameworkVersion: '4.30.1', runUrl: RUN_2 });
});

test('a quarantined example keeps its runs but loses verified', () => {
  const first = mergeResults({}, [result()], RUN_1);
  const merged = mergeResults(first, [], RUN_2, { quarantined: ['aws-node'] });
  assert.equal(merged['aws-node'].verified, null);
  assert.equal(merged['aws-node'].runs.length, 1);
});

test('a skipped (quarantined) result counts as quarantine and is not recorded as a run', () => {
  const first = mergeResults({}, [result()], RUN_1);
  const merged = mergeResults(first, [result({ result: 'skip', detail: 'quarantined: outage', stage: null, startedAt: '2026-11-20T03:20:00.000Z' })], RUN_2);
  assert.equal(merged['aws-node'].verified, null);
  assert.deepEqual(
    merged['aws-node'].runs.map((r) => r.runUrl),
    [RUN_1],
  );
});

test('an example that never ran is absent, also when it is quarantined', () => {
  const merged = mergeResults({}, [result()], RUN_1, { quarantined: ['aws-python'] });
  assert.deepEqual(Object.keys(merged), ['aws-node']);
});

test('examples not in this run keep their entries', () => {
  const first = mergeResults({}, [result({ example: 'aws-python' })], RUN_1);
  const merged = mergeResults(first, [result()], RUN_2);
  assert.deepEqual(Object.keys(merged).sort(), ['aws-node', 'aws-python']);
  assert.deepEqual(merged['aws-python'], first['aws-python']);
});

test('only latest results count; canary and pinned versions are ignored', () => {
  const merged = mergeResults({}, [result({ frameworkVersion: 'canary' }), result({ example: 'aws-python', frameworkVersion: '4.4.7' })], RUN_1);
  assert.deepEqual(merged, {});
});

test('several results for one example in one run are ordered newest first', () => {
  const merged = mergeResults({}, [result({ result: 'fail', startedAt: '2026-11-19T01:00:00.000Z' }), result({ startedAt: '2026-11-19T02:00:00.000Z' })], RUN_1);
  assert.deepEqual(
    merged['aws-node'].runs.map((r) => r.result),
    ['pass', 'fail'],
  );
});

test('the requested version stands in when the resolved one is unknown', () => {
  const merged = mergeResults({}, [result({ result: 'fail', resolvedVersion: 'unknown' })], RUN_1);
  assert.equal(merged['aws-node'].runs[0].frameworkVersion, 'latest');
});

test('mergeResults does not change its input', () => {
  const previous = mergeResults({}, [result()], RUN_1);
  const copy = structuredClone(previous);
  mergeResults(previous, [result({ result: 'fail' })], RUN_2, { quarantined: ['aws-node'] });
  assert.deepEqual(previous, copy);
});

// --- renderBadge

test('the badge reads Verified, the date and the Framework version', () => {
  const svg = renderBadge({ runs: [], verified: { date: '2026-11-19', frameworkVersion: '4.30.1', runUrl: RUN_1 } });
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.ok(svg.includes('Verified · 2026-11-19 · Framework 4.30.1'), svg);
  assert.ok(svg.includes('2026-11-19'));
  assert.ok(svg.includes('4.30.1'));
});

test('the badge escapes XML in the version', () => {
  const svg = renderBadge({ runs: [], verified: { date: '2026-11-19', frameworkVersion: '4<&>"', runUrl: RUN_1 } });
  assert.ok(svg.includes('4&lt;&amp;&gt;&quot;'), svg);
  assert.ok(!svg.includes('4<&>'));
});

test('an entry without verified renders a 1x1 transparent SVG', () => {
  const svg = renderBadge({ runs: [], verified: null });
  assert.match(svg, /width="1"/);
  assert.match(svg, /height="1"/);
  assert.doesNotMatch(svg, /Verified/);
});

test('badgePath keeps nested example directories as directories', () => {
  assert.equal(badgePath('aws-node'), 'badges/aws-node.svg');
  assert.equal(badgePath('mcp/minimal'), 'badges/mcp/minimal.svg');
  for (const bad of ['../x', 'a/../b', '/abs', 'a//b', '', 'a\\b']) assert.throws(() => badgePath(bad), bad);
});

// --- publish-verified CLI

function repo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-test-'));
  const write = (rel, text) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  };
  const manifest = (dir, test) =>
    write(
      `${dir}/example.json`,
      JSON.stringify({
        title: dir,
        description: 'An example.',
        language: 'node',
        platform: 'AWS',
        framework: 'v4',
        author: { name: 'Serverless, Inc.', link: 'https://github.com/serverless' },
        services: ['lambda'],
        test,
      }),
    );
  manifest('aws-node', { tier: 'fast', checks: [{ script: { path: 'test/smoke.mjs' } }] });
  manifest('mcp/minimal', { tier: 'fast', checks: [{ script: { path: 'test/smoke.mjs' } }] });
  manifest('aws-python', { tier: 'fast', checks: [{ script: { path: 'test/smoke.mjs' } }], quarantine: { reason: 'Outage', since: '2026-11-01' } });
  return { root, write };
}

test('publish-verified writes results.json and a badge per example, nested ones included', () => {
  const { root, write } = repo();
  write('results/aws-node--latest.json', JSON.stringify(result()));
  write('results/mcp__minimal--latest.json', JSON.stringify(result({ example: 'mcp/minimal', result: 'fail' })));
  write('results/aws-node--canary.json', JSON.stringify(result({ frameworkVersion: 'canary', result: 'fail' })));
  const out = path.join(root, 'site');
  write('site/results.json', JSON.stringify(mergeResults({}, [result({ example: 'aws-python' })], RUN_1)));
  const logs = [];
  const code = run(['--results-dir', path.join(root, 'results'), '--out', out, '--run-url', RUN_2], { root, log: (l) => logs.push(l) });
  assert.equal(code, 0, logs.join('\n'));
  const results = JSON.parse(fs.readFileSync(path.join(out, 'results.json'), 'utf8'));
  assert.deepEqual(Object.keys(results), ['aws-node', 'aws-python', 'mcp/minimal']);
  assert.equal(results['aws-node'].verified.runUrl, RUN_2);
  assert.equal(results['aws-node'].runs.length, 1, 'the canary result is left out');
  assert.equal(results['aws-python'].verified, null, 'quarantined');
  assert.equal(results['mcp/minimal'].verified, null);
  assert.match(fs.readFileSync(path.join(out, 'badges/aws-node.svg'), 'utf8'), /Verified · 2026-11-19 · Framework 4\.30\.1/);
  assert.match(fs.readFileSync(path.join(out, 'badges/mcp/minimal.svg'), 'utf8'), /width="1"/);
  assert.match(fs.readFileSync(path.join(out, 'badges/aws-python.svg'), 'utf8'), /width="1"/);
});

test('publish-verified ignores results for directories that are not tested examples', () => {
  const { root, write } = repo();
  write('results/a.json', JSON.stringify(result({ example: '../escape' })));
  write('results/b.json', JSON.stringify(result({ example: 'not-an-example' })));
  write('results/c.json', JSON.stringify(result()));
  const logs = [];
  const out = path.join(root, 'site');
  assert.equal(run(['--results-dir', path.join(root, 'results'), '--out', out, '--run-url', RUN_1], { root, log: (l) => logs.push(l) }), 0);
  assert.deepEqual(Object.keys(JSON.parse(fs.readFileSync(path.join(out, 'results.json'), 'utf8'))), ['aws-node']);
  assert.equal(logs.filter((l) => /ignored/.test(l)).length, 2, logs.join('\n'));
  assert.equal(fs.existsSync(path.join(root, 'escape.svg')), false);
});

test('publish-verified starts from nothing when there is no results directory or previous results.json', () => {
  const { root } = repo();
  const out = path.join(root, 'site');
  assert.equal(run(['--results-dir', path.join(root, 'none'), '--out', out, '--run-url', RUN_1], { root, log: () => {} }), 0);
  assert.equal(fs.readFileSync(path.join(out, 'results.json'), 'utf8'), '{}\n');
});

test('publish-verified usage errors exit 2', () => {
  const { root } = repo();
  for (const argv of [[], ['--results-dir', 'r', '--out', 'o'], ['--results-dir', 'r', '--out', 'o', '--run-url', 'x', '--other']]) {
    const logs = [];
    assert.equal(run(argv, { root, log: (l) => logs.push(l) }), 2, argv.join(' '));
    assert.ok(logs.length > 0);
  }
});

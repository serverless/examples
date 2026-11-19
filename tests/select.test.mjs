import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { selectExamples } from '../scripts/lib/select.mjs';
import { run } from '../scripts/select-examples.mjs';

const check = [{ http: { output: 'Url', status: 200 } }];
const tested = (dir, tier = 'fast', extra = {}) => ({ dir, test: { tier, checks: check, ...extra } });
const quarantined = (dir, tier = 'fast') =>
  tested(dir, tier, { quarantine: { reason: 'upstream outage', since: '2026-11-01' } });
const untested = (dir) => ({ dir });

const manifests = [
  tested('aws-node'),
  tested('aws-python', 'slow'),
  untested('aws-ruby'),
  tested('mcp/minimal'),
  tested('mcp/custom/hono'),
  tested('mcp/custom/rest-api', 'slow'),
  tested('compose-shared-services'),
  quarantined('aws-go'),
  quarantined('aws-java', 'slow'),
];
const sharedFiles = {
  'mcp/custom/client.mjs': ['mcp/custom/hono/client.mjs', 'mcp/custom/rest-api/client.mjs', 'aws-ruby/client.mjs'],
};
const select = (opts) => selectExamples({ manifests, sharedFiles, ...opts });
const ALL_ACTIVE = ['aws-node', 'aws-python', 'compose-shared-services', 'mcp/custom/hono', 'mcp/custom/rest-api', 'mcp/minimal'];

test('a changed file selects the example that contains it', () => {
  const r = select({ changedFiles: ['aws-node/handler.js'] });
  assert.deepEqual(r.dirs, ['aws-node']);
  assert.deepEqual(r.quarantined, []);
  assert.match(r.reason, /1 example/);
});

test('a changed file selects the example with the longest matching directory', () => {
  assert.deepEqual(select({ changedFiles: ['mcp/minimal/src/x.mjs'] }).dirs, ['mcp/minimal']);
  assert.deepEqual(select({ changedFiles: ['compose-shared-services/users/handler.js'] }).dirs, ['compose-shared-services']);
});

test('a directory name that only shares a prefix does not select the example', () => {
  assert.deepEqual(select({ changedFiles: ['aws-node-http-api/handler.js'] }).dirs, []);
});

test('several changed files select each example once, sorted', () => {
  const r = select({ changedFiles: ['mcp/minimal/a.js', 'aws-node/a.js', 'aws-node/b.js'] });
  assert.deepEqual(r.dirs, ['aws-node', 'mcp/minimal']);
});

test('a changed example without a test block is not selected', () => {
  const r = select({ changedFiles: ['aws-ruby/handler.rb'] });
  assert.deepEqual(r, { dirs: [], quarantined: [], reason: 'no tested example changed' });
});

test('a changed quarantined example is returned as quarantined, not selected', () => {
  const r = select({ changedFiles: ['aws-go/main.go', 'aws-node/handler.js'] });
  assert.deepEqual(r.dirs, ['aws-node']);
  assert.deepEqual(r.quarantined, ['aws-go']);
});

test('empty changedFiles selects nothing and says so', () => {
  assert.deepEqual(select({ changedFiles: [] }), { dirs: [], quarantined: [], reason: 'no tested example changed' });
});

test('a change under tests/ or outside any example selects nothing', () => {
  const r = select({ changedFiles: ['tests/select.test.mjs', 'docs/guide.md', 'mcp/README.md'] });
  assert.deepEqual(r.dirs, []);
  assert.equal(r.reason, 'no tested example changed');
});

for (const file of ['scripts/lib/select.mjs', '.github/workflows/test.yml', 'package.json', 'validate.js', '.editorconfig']) {
  test(`a change to ${file} selects every tested example`, () => {
    const r = select({ changedFiles: [file] });
    assert.deepEqual(r.dirs, ALL_ACTIVE);
    assert.deepEqual(r.quarantined, ['aws-go', 'aws-java']);
    assert.match(r.reason, new RegExp(file.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')));
  });
}

for (const file of ['README.md', 'examples.json', 'LICENSE.txt', 'AGENTS.md', '.gitignore']) {
  test(`a change to the root ${file} selects nothing`, () => {
    assert.deepEqual(select({ changedFiles: [file] }).dirs, []);
  });
}

test('a change to a shared canonical file selects the tested examples that hold its copies', () => {
  const r = select({ changedFiles: ['mcp/custom/client.mjs'] });
  assert.deepEqual(r.dirs, ['mcp/custom/hono', 'mcp/custom/rest-api']);
});

test('tier narrows a diff selection', () => {
  const r = select({ changedFiles: ['aws-node/a.js', 'aws-python/a.py'], tier: 'slow' });
  assert.deepEqual(r.dirs, ['aws-python']);
});

test('all with a tier returns every tested example in it, quarantined ones apart', () => {
  const fast = select({ all: true, tier: 'fast' });
  assert.deepEqual(fast.dirs, ['aws-node', 'compose-shared-services', 'mcp/custom/hono', 'mcp/minimal']);
  assert.deepEqual(fast.quarantined, ['aws-go']);
  assert.match(fast.reason, /fast/);
  const slow = select({ all: true, tier: 'slow' });
  assert.deepEqual(slow.dirs, ['aws-python', 'mcp/custom/rest-api']);
  assert.deepEqual(slow.quarantined, ['aws-java']);
});

test('all with an empty tier returns nothing and says so', () => {
  const r = selectExamples({ manifests: [tested('aws-node', 'fast')], all: true, tier: 'slow' });
  assert.deepEqual(r, { dirs: [], quarantined: [], reason: 'tier has no examples' });
});

test('all with zero tested examples in the repository throws', () => {
  assert.throws(
    () => selectExamples({ manifests: [untested('aws-node')], all: true, tier: 'fast' }),
    { message: 'no tested examples found' },
  );
  assert.throws(() => selectExamples({ manifests: [], all: true, tier: 'fast' }), { message: 'no tested examples found' });
});

test('all with only quarantined examples in the tier selects nothing', () => {
  const r = selectExamples({ manifests: [quarantined('aws-go')], all: true, tier: 'fast' });
  assert.deepEqual(r.dirs, []);
  assert.deepEqual(r.quarantined, ['aws-go']);
});

test('changedFiles and all together are rejected', () => {
  assert.throws(() => select({ changedFiles: [], all: true }), /either changedFiles or all/);
  assert.throws(() => select({}), /either changedFiles or all/);
});

// --- CLI ---------------------------------------------------------------------

const tempRoots = [];
after(() => {
  for (const dir of tempRoots) fs.rmSync(dir, { recursive: true, force: true });
});

// Builds a temporary repository layout with one example.json per entry.
function layout(entries) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'examples-select-'));
  tempRoots.push(root);
  for (const m of entries) {
    fs.mkdirSync(path.join(root, m.dir), { recursive: true });
    const { dir, ...body } = m;
    fs.writeFileSync(path.join(root, dir, 'example.json'), JSON.stringify(body));
  }
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'scripts', 'shared-files.json'), JSON.stringify(sharedFiles));
  return root;
}

function cli(args, { root, diff = '' } = {}) {
  const out = [];
  const err = [];
  const calls = [];
  const exec = (cmd, cmdArgs, opts) => {
    calls.push({ cmd, args: cmdArgs, cwd: opts.cwd });
    return diff;
  };
  const code = run(args, { root, exec, stdout: (s) => out.push(s), stderr: (s) => err.push(s) });
  return { code, out: out.join('\n'), err: err.join('\n'), calls };
}

test('CLI --changed runs git diff against the base and prints the selection as JSON', () => {
  const root = layout([tested('aws-node'), tested('mcp/custom/hono'), quarantined('aws-go')]);
  const r = cli(['--changed', 'abc123'], { root, diff: 'aws-node/handler.js\nmcp/custom/client.mjs\naws-go/main.go\n' });
  assert.equal(r.code, 0);
  assert.deepEqual(r.calls, [{ cmd: 'git', args: ['diff', '--name-only', '--no-renames', 'abc123...HEAD'], cwd: root }]);
  const json = JSON.parse(r.out);
  assert.deepEqual(Object.keys(json), ['dirs', 'quarantined', 'reason']);
  assert.deepEqual(json.dirs, ['aws-node', 'mcp/custom/hono']);
  assert.deepEqual(json.quarantined, ['aws-go']);
});

test('CLI --changed selects both examples when a file moves from one to another', () => {
  const root = layout([tested('ex-a'), tested('ex-b')]);
  // With --no-renames, git lists a moved file as a deletion and an addition.
  const r = cli(['--changed', 'abc123'], { root, diff: 'ex-a/lib.js\nex-b/lib.js\n' });
  assert.equal(r.code, 0);
  assert.ok(r.calls[0].args.includes('--no-renames'));
  assert.deepEqual(JSON.parse(r.out).dirs, ['ex-a', 'ex-b']);
});

test('CLI --changed with no example manifests prints an empty selection', () => {
  const root = layout([]);
  const r = cli(['--changed', 'abc123'], { root, diff: 'aws-node/handler.js\n' });
  assert.equal(r.code, 0);
  assert.deepEqual(JSON.parse(r.out), { dirs: [], quarantined: [], reason: 'no tested example changed' });
});

test('CLI --all --tier prints the tier as JSON', () => {
  const root = layout([tested('aws-node'), tested('aws-python', 'slow'), untested('aws-ruby')]);
  const r = cli(['--all', '--tier', 'slow'], { root });
  assert.equal(r.code, 0);
  assert.deepEqual(JSON.parse(r.out).dirs, ['aws-python']);
  assert.equal(r.calls.length, 0);
});

test('CLI --all with zero tested examples exits 1 with the message on stderr', () => {
  const root = layout([untested('aws-ruby')]);
  const r = cli(['--all', '--tier', 'fast'], { root });
  assert.equal(r.code, 1);
  assert.equal(r.out, '');
  assert.match(r.err, /no tested examples found/);
});

for (const args of [[], ['--all'], ['--all', '--tier', 'medium'], ['--changed'], ['--changed', 'abc', '--all', '--tier', 'fast'], ['--bogus']]) {
  test(`CLI rejects ${JSON.stringify(args)} with usage on stderr`, () => {
    const r = cli(args, { root: layout([tested('aws-node')]) });
    assert.equal(r.code, 1);
    assert.equal(r.out, '');
    assert.match(r.err, /Usage:/);
  });
}

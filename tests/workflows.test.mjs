import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { run as cleanupReport } from '../scripts/cleanup-report.mjs';
import { EXISTING_STACK_STATUSES } from '../scripts/test-example.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOWS = path.join(ROOT, '.github', 'workflows');
const FILES = ['ci.yml', 'sweep.yml', 'publish-verified.yml', 'cleanup.yml'];
const FORK_GUARD = "github.event_name == 'push' || github.event.pull_request.head.repo.full_name == github.repository";

const read = (file) => fs.readFileSync(path.join(WORKFLOWS, file), 'utf8');

// Returns the text of one job: from `  <name>:` to the next job key or the end.
function job(text, name) {
  const lines = text.split('\n');
  const start = lines.indexOf(`  ${name}:`);
  assert.notEqual(start, -1, `job ${name} not found`);
  let end = start + 1;
  while (end < lines.length && !/^ {2}[A-Za-z_][\w-]*:\s*$/.test(lines[end])) end++;
  return lines.slice(start, end).join('\n');
}

// --- workflows, read as text

test('the four workflows exist', () => {
  for (const file of FILES) assert.ok(fs.existsSync(path.join(WORKFLOWS, file)), file);
});

test('no workflow uses pull_request_target', () => {
  for (const file of FILES) assert.doesNotMatch(read(file), /pull_request_target/, file);
});

test('every action is pinned to a 40-character commit SHA with a version comment', () => {
  for (const file of FILES) {
    const uses = read(file).match(/^\s*(?:-\s+)?uses:.*$/gm) ?? [];
    assert.ok(uses.length > 0, file);
    for (const line of uses) assert.match(line, /uses: [\w.-]+\/[\w.-]+@[0-9a-f]{40} # v\d+(\.\d+)*$/, `${file}: ${line.trim()}`);
  }
});

test('no workflow cancels a run in progress', () => {
  for (const file of FILES) assert.doesNotMatch(read(file), /cancel-in-progress:\s*true/, file);
});

test('the ci live job carries the fork guard', () => {
  const live = job(read('ci.yml'), 'live');
  assert.ok(live.includes(`if: (${FORK_GUARD})`), live.split('\n').find((l) => l.includes('if:')));
});

test('the ci static job has no secrets and only reads contents', () => {
  const stat = job(read('ci.yml'), 'static');
  assert.doesNotMatch(stat, /secrets\./);
  assert.doesNotMatch(stat, /environment:/);
  assert.match(stat, /permissions:\n\s+contents: read\n/);
  for (const command of ['npm test', 'npm run validate', 'npm run check-docs']) assert.ok(stat.includes(`run: ${command}`), command);
});

for (const file of ['ci.yml', 'sweep.yml']) {
  test(`${file}: the live job has the environment, limits, concurrency group and cleanup step`, () => {
    const live = job(read(file), 'live');
    for (const line of [
      'environment: live-tests',
      'timeout-minutes: 50',
      'fail-fast: false',
      'max-parallel: 4',
      'group: live-${{ matrix.dir }}',
      'id-token: write',
      'contents: read',
      'SERVERLESS_ACCESS_KEY: ${{ secrets.SERVERLESS_ACCESS_KEY_DEV }}',
      'SERVERLESS_PLATFORM_STAGE: dev',
      'aws-region: ${{ vars.EXAMPLES_REGION }}',
    ]) {
      assert.ok(live.includes(line), `${file}: ${line}`);
    }
    for (const n of [1, 2, 3]) assert.ok(live.includes(`vars.EXAMPLES_ROLE_ARN_${n}`), `role ${n}`);
    assert.match(live, /if: always\(\) && steps\.stage\.outputs\.stage != ''\n(.*\n)*?\s+run: node scripts\/test-example\.mjs "\$EXAMPLE_DIR" --remove-only --stage "\$STAGE"/);
    assert.doesNotMatch(live, /--region/, 'the region comes from AWS_REGION so the manifest region wins');
  });
}

test('only publish-verified may write contents', () => {
  for (const file of FILES) {
    const writes = /contents: write/.test(read(file));
    assert.equal(writes, file === 'publish-verified.yml', file);
  }
});

test('every workflow starts with no permissions and every job states its own', () => {
  for (const file of FILES) {
    const text = read(file);
    assert.match(text, /^permissions: \{\}$/m, file);
    const jobs = text.slice(text.indexOf('\njobs:\n')).match(/^ {2}[A-Za-z_][\w-]*:\s*$/gm);
    for (const name of jobs) assert.match(job(text, name.trim().slice(0, -1)), /\n {4}permissions:\n/, `${file} ${name.trim()}`);
  }
});

// Returns the body of every `run: |` block in `text`.
function runBlocks(text) {
  const blocks = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)(?:- )?run: \|\s*$/);
    if (!m) continue;
    const body = [];
    while (i + 1 < lines.length && (lines[i + 1].trim() === '' || lines[i + 1].search(/\S/) > m[1].length)) body.push(lines[++i]);
    blocks.push(body.join('\n'));
  }
  return blocks;
}

test('every multi-line script with a pipeline sets pipefail', () => {
  for (const file of FILES) {
    for (const block of runBlocks(read(file))) {
      // A pipe outside quotes, comments and `[[ =~ ]]` patterns: `cmd | cmd`, not `||`.
      const piped = block.split('\n').filter((l) => !l.includes('=~')).some((l) =>
        /\|/.test(
          l
            .replace(/'[^']*'|"(?:\\.|[^"\\])*"/g, '')
            .replace(/\|\|/g, '')
            .replace(/#.*$/, ''),
        ),
      );
      if (piped) assert.match(block, /^\s*set -o pipefail$/m, `${file}:\n${block}`);
    }
  }
});

test('every step that runs --remove-only has a timeout', () => {
  for (const file of FILES) {
    // Steps are list items at the same indent; each one ends where the next begins.
    const steps = read(file).split(/\n(?= {6}- )/);
    for (const step of steps.filter((s) => s.includes('--remove-only'))) assert.match(step, /\n {8}timeout-minutes: \d+\n/, `${file}:\n${step}`);
  }
  assert.ok(['ci.yml', 'sweep.yml'].every((f) => read(f).includes('--remove-only')));
});

test('publish-verified reads only the triggering attempt', () => {
  const publish = read('publish-verified.yml');
  assert.match(publish, /pattern: result-\*--latest-\$\{\{ github\.event\.workflow_run\.run_attempt \}\}/);
  assert.match(publish, /RUN_ATTEMPT: \$\{\{ github\.event\.workflow_run\.run_attempt \}\}/);
  assert.match(publish, /--latest-\$\{RUN_ATTEMPT\}\$/);
});

test('no step is named after an empty value', () => {
  assert.doesNotMatch(read('sweep.yml'), /^\s+- name: .*\$\{\{ needs\.select\.outputs\.second \}\}/m);
});

test('ci selects with full history, and publish-verified reads only latest results of v4 runs', () => {
  assert.match(job(read('ci.yml'), 'select'), /fetch-depth: 0/);
  const publish = read('publish-verified.yml');
  assert.match(publish, /workflows: \[ci, sweep\]/);
  assert.match(publish, /branches: \[v4\]/);
  assert.match(publish, /pattern: result-\*--latest-\$\{\{ github\.event\.workflow_run\.run_attempt \}\}/);
  assert.doesNotMatch(publish, /workflow_run\.event == 'pull_request'/);
});

// --- cleanup report

const HOUR = 3_600_000;
const NOW = Date.UTC(2026, 10, 19, 12);

function stacks(...rows) {
  return JSON.stringify({
    StackSummaries: rows.map(([StackName, hoursAgo, StackStatus = 'CREATE_COMPLETE']) => ({
      StackId: `arn:aws:cloudformation:us-east-1:123456789012:stack/${StackName}/0000`,
      StackName,
      StackStatus,
      CreationTime: new Date(NOW - hoursAgo * HOUR).toISOString(),
    })),
  });
}

async function report(args, replies) {
  const calls = [];
  const out = [];
  const err = [];
  const exec = async (cmd, argv) => {
    calls.push([cmd, ...argv]);
    const region = argv[argv.indexOf('--region') + 1];
    return { status: 0, stdout: '', stderr: '', ...replies[region] };
  };
  const code = await cleanupReport(args, { exec, now: () => NOW, out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, calls, out: out.join('\n'), err: err.join('\n') };
}

test('the cleanup report lists test-stage stacks older than 24 hours in every region', async () => {
  const { code, calls, out } = await report(['--regions', 'us-east-1, eu-west-1'], {
    'us-east-1': {
      stdout: stacks(
        ['aws-node-exabc123def', 30],
        ['aws-node-exabc123xyz', 2],
        ['aws-python-exzzz999zzz', 50, 'DELETE_COMPLETE'],
        ['production-api', 500],
        ['aws-node-dev', 500],
      ),
    },
    'eu-west-1': { stdout: stacks(['mcp-minimal-ex000111222', 25, 'DELETE_FAILED']) },
  });
  assert.equal(code, 0);
  assert.deepEqual(calls, [
    ['aws', 'cloudformation', 'list-stacks', '--region', 'us-east-1', '--output', 'json', '--stack-status-filter', ...EXISTING_STACK_STATUSES],
    ['aws', 'cloudformation', 'list-stacks', '--region', 'eu-west-1', '--output', 'json', '--stack-status-filter', ...EXISTING_STACK_STATUSES],
  ]);
  assert.match(out, /: 2 \(us-east-1: 1, eu-west-1: 1\)/);
  assert.ok(out.includes('| us-east-1 | aws-node-exabc123def | CREATE_COMPLETE |'), out);
  assert.ok(out.includes('| eu-west-1 | mcp-minimal-ex000111222 | DELETE_FAILED |'), out);
  for (const absent of ['exabc123xyz', 'exzzz999zzz', 'production-api', 'aws-node-dev']) assert.ok(!out.includes(absent), absent);
});

test('the cleanup report never prints account ids or ARNs', async () => {
  const { out, err } = await report(['--regions', 'us-east-1,eu-west-1'], {
    'us-east-1': { stdout: stacks(['aws-node-exabc123def', 30]) },
    'eu-west-1': { status: 254, stderr: 'User: arn:aws:sts::123456789012:assumed-role/x is not authorized' },
  });
  for (const text of [out, err]) {
    assert.doesNotMatch(text, /arn:aws/);
    assert.doesNotMatch(text, /123456789012/);
  }
});

test('the cleanup report says when nothing is left', async () => {
  const { code, out } = await report(['--regions', 'us-east-1'], { 'us-east-1': { stdout: stacks() } });
  assert.equal(code, 0);
  assert.match(out, /: 0 \(us-east-1: 0\)/);
  assert.doesNotMatch(out, /\| Region/);
});

test('the cleanup report exits 1 when a region cannot be listed, and still reports the others', async () => {
  const { code, out, err } = await report(['--regions', 'us-east-1 eu-west-1'], {
    'us-east-1': { status: 255 },
    'eu-west-1': { stdout: stacks(['aws-node-exabc123def', 30]) },
  });
  assert.equal(code, 1);
  assert.match(err, /could not list the stacks in us-east-1/);
  assert.match(out, /us-east-1: not listed, eu-west-1: 1/);
});

test('the cleanup report rejects missing or invalid regions with exit 2', async () => {
  for (const args of [[], ['--regions', ''], ['--regions', 'us-east-1;rm'], ['--other']]) {
    const { code, calls } = await report(args, {});
    assert.equal(code, 2, args.join(' '));
    assert.deepEqual(calls, []);
  }
});

test('the cleanup script has no delete command', () => {
  const source = fs.readFileSync(path.join(ROOT, 'scripts', 'cleanup-report.mjs'), 'utf8');
  assert.doesNotMatch(source, /delete-stack|'remove'/);
});

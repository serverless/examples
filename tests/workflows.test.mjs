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

// The `if:` of a job, from its job-level line.
const jobIf = (file, name) => job(read(file), name).split('\n').find((l) => /^ {4}if: /.test(l)) ?? '';

test('the ci select and live jobs carry the fork guard', () => {
  for (const name of ['select', 'live']) {
    const line = jobIf('ci.yml', name);
    assert.ok(line.includes(`(${FORK_GUARD})`), `${name}: ${line}`);
  }
});

const REPO_GUARD = "github.repository == 'serverless/examples'";

for (const [file, name] of [
  ['ci.yml', 'select'],
  ['ci.yml', 'live'],
  ['sweep.yml', 'select'],
  ['sweep.yml', 'live'],
  ['cleanup.yml', 'report'],
  ['publish-verified.yml', 'publish'],
]) {
  test(`${file}: the ${name} job runs only in the repository the AWS roles exist for`, () => {
    const line = jobIf(file, name);
    // The guard comes first and the rest is one parenthesized or `&&`-joined term, so `||` cannot bypass it.
    assert.ok(line.startsWith(`    if: ${REPO_GUARD}`), `${file} ${name}: ${line}`);
    const rest = line.slice(`    if: ${REPO_GUARD}`.length);
    const outside = rest.replace(/\((?:[^()]|\([^()]*\))*\)/g, '');
    assert.doesNotMatch(outside, /\|\|/, `${file} ${name}: ${line}`);
  });
}

test('the ci static job runs in every copy of the repository', () => {
  assert.doesNotMatch(job(read('ci.yml'), 'static'), /github\.repository/);
});

test('the ci static job has no secrets and only reads contents', () => {
  const stat = job(read('ci.yml'), 'static');
  assert.doesNotMatch(stat, /secrets\./);
  assert.doesNotMatch(stat, /environment:/);
  assert.match(stat, /permissions:\n\s+contents: read\n/);
  for (const command of ['npm test', 'npm run validate', 'npm run check-docs']) assert.ok(stat.includes(`run: ${command}`), command);
});

// Each version: a 15-minute run and a 15-minute remove; each stage: a 20-minute
// final remove. ci runs one version and one stage per job; the sweep's nightly
// job runs two of each.
const LIVE_TIMEOUT = { 'ci.yml': 50, 'sweep.yml': 100 };

for (const file of ['ci.yml', 'sweep.yml']) {
  test(`${file}: the live job has the limits, concurrency group and cleanup step`, () => {
    const live = job(read(file), 'live');
    assert.match(live, new RegExp(`\\n {4}timeout-minutes: ${LIVE_TIMEOUT[file]}\\n`), `${file}: job timeout`);
    for (const line of [
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
    // Role ARNs carry account ids; as secrets they are masked in the step's logged inputs.
    for (const n of [1, 2, 3]) assert.ok(live.includes(`secrets.EXAMPLES_ROLE_ARN_${n}`), `role ${n}`);
    assert.match(live, /if: always\(\) && steps\.stage\.outputs\.stage != ''\n(.*\n)*?\s+run: node scripts\/test-example\.mjs "\$EXAMPLE_DIR" --remove-only --stage "\$STAGE"/);
    assert.doesNotMatch(live, /--region/, 'the region comes from AWS_REGION so the manifest region wins');
  });
}

// Redeploying a stage right after removing it recreates IAM roles under the same
// names, and Lambda can reject a role IAM has not finished propagating.
test('sweep.yml: the second version deploys to its own stage, and both stages are removed', () => {
  const live = job(read('sweep.yml'), 'live');
  assert.match(live, /echo "stage2=\$stage2" >> "\$GITHUB_OUTPUT"/);
  const second = live.slice(live.indexOf('id: second'));
  assert.match(second.slice(0, second.indexOf('run:')), /STAGE: \$\{\{ steps\.stage\.outputs\.stage2 \}\}/);
  assert.match(live, /if: always\(\) && steps\.stage\.outputs\.stage2 != ''\n(.*\n)*?\s+STAGE: \$\{\{ steps\.stage\.outputs\.stage2 \}\}\n(.*\n)*?\s+run: node scripts\/test-example\.mjs "\$EXAMPLE_DIR" --remove-only --stage "\$STAGE"/);
});

test('no workflow names a GitHub environment', () => {
  for (const file of FILES) assert.doesNotMatch(read(file), /^\s*environment:/m, file);
});

for (const [file, name] of [['sweep.yml', 'live'], ['cleanup.yml', 'report']]) {
  test(`${file}: the ${name} job first stops unless the run is on v4`, () => {
    const text = job(read(file), name);
    const steps = text.slice(text.indexOf('\n    steps:\n')).split(/\n(?= {6}- )/);
    const first = steps[1];
    assert.ok(first, `${file}: no steps`);
    assert.match(first, /\n {10}REF: \$\{\{ github\.ref \}\}\n/, first);
    assert.match(first, /if \[\[ "\$REF" != refs\/heads\/v4 \]\]; then\n\s+echo "::error::.*"\n\s+exit 1\n/, first);
    const script = first.slice(first.indexOf('run: |'));
    assert.doesNotMatch(script, /\$\{\{/, 'values reach the script through env');
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

test('every step that runs --remove-only has a 20-minute timeout', () => {
  for (const file of FILES) {
    // Steps are list items at the same indent; each one ends where the next begins.
    const steps = read(file).split(/\n(?= {6}- )/);
    // 20 minutes: remove's own 15-minute budget plus the listing and install around it.
    for (const step of steps.filter((s) => s.includes('--remove-only'))) assert.match(step, /\n {8}timeout-minutes: 20\n/, `${file}:\n${step}`);
  }
  assert.ok(['ci.yml', 'sweep.yml'].every((f) => read(f).includes('--remove-only')));
});

test('publish-verified reads only the triggering attempt', () => {
  const publish = read('publish-verified.yml');
  assert.match(publish, /pattern: result-\*--latest-\$\{\{ github\.event\.workflow_run\.run_attempt \}\}/);
  assert.match(publish, /RUN_ATTEMPT: \$\{\{ github\.event\.workflow_run\.run_attempt \}\}/);
  assert.match(publish, /--latest-\$\{RUN_ATTEMPT\}\$/);
});

test('publish-verified publishes also when the run has no latest results; only the download needs some', () => {
  const steps = job(read('publish-verified.yml'), 'publish').split(/\n(?= {6}- )/).slice(1);
  const counted = steps.filter((s) => s.includes('steps.find.outputs.count'));
  assert.equal(counted.length, 1, counted.join('\n---\n'));
  assert.match(counted[0], /uses: actions\/download-artifact@/);
  assert.match(counted[0], /if: steps\.find\.outputs\.count != '0'\n/);
  for (const name of ['Check out the scripts', 'Merge the results and write the badges', 'Commit to the verified branch']) {
    assert.ok(steps.some((s) => s.includes(`- name: ${name}`)), name);
  }
  const commit = steps.find((s) => s.includes('- name: Commit to the verified branch'));
  assert.match(commit, /if git diff --cached --quiet; then\n\s+echo "Nothing changed"\n\s+exit 0\n/);
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

test('no workflow reads a role ARN from a repository variable, which job logs print in clear', () => {
  for (const file of FILES) assert.doesNotMatch(read(file), /vars\.EXAMPLES_ROLE_ARN/, file);
});

test('sweep.yml renews the AWS credentials before the second version and before the final remove', () => {
  const live = job(read('sweep.yml'), 'live');
  const renew = [...live.matchAll(/- name: Renew the AWS credentials[^\n]*\n((?: {8}.*\n)+)/g)].map((m) => m[1]);
  assert.equal(renew.length, 2);
  for (const body of renew) {
    assert.match(body, /uses: aws-actions\/configure-aws-credentials@[0-9a-f]{40}/);
    assert.match(body, /unset-current-credentials: true/);
  }
  const at = (s) => live.indexOf(s);
  assert.ok(at('Renew the AWS credentials for the second version') < at("id: second"));
  assert.ok(at('Renew the AWS credentials for the final remove') < at('- name: Remove what the stage left'));
});

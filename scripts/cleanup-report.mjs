#!/usr/bin/env node
// Reports CloudFormation stacks that example test runs may have left behind:
// stacks whose names end in a test stage (`-ex` + 9 lowercase base36
// characters) and that were created more than 24 hours ago. It only reports;
// it deletes nothing.
//
// Usage: node scripts/cleanup-report.mjs --regions <list>
//
//   --regions <list>  AWS regions, separated by commas or spaces
//
// AWS credentials come from the caller's environment. Prints a Markdown report
// (counts per region, then stack names, statuses and creation times) on stdout,
// fit for a GitHub job summary. Account ids and ARNs are never printed.
// Exit code: 0 the report is complete, 1 a region could not be listed,
// 2 usage error.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { runCommand } from './lib/exec.mjs';

const USAGE = 'Usage: node scripts/cleanup-report.mjs --regions <list>';
const TEST_STACK = /-ex[a-z0-9]{9}$/;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const REGION = /^[a-z]{2}(-[a-z]+)+-\d+$/;
const LIST_TIMEOUT_MS = 5 * 60_000;

/**
 * Runs the CLI with `args`; resolves to the exit code. `exec` has the
 * signature of runCommand and runs `aws`; `now` gives the time in ms.
 */
export async function run(args, { exec = runCommand, now = Date.now, out = console.log, err = console.error } = {}) {
  let regions;
  try {
    const { values } = parseArgs({ args, options: { regions: { type: 'string' } } });
    regions = [...new Set((values.regions ?? '').split(/[\s,]+/).filter(Boolean))];
    if (regions.length === 0) throw new Error('--regions needs at least one region');
    const bad = regions.filter((r) => !REGION.test(r));
    if (bad.length) throw new Error(`not an AWS region: ${bad.join(', ')}`);
  } catch (e) {
    err(e.message);
    err(USAGE);
    return 2;
  }

  const found = [];
  const counts = [];
  const unreadable = [];
  for (const region of regions) {
    const stacks = await listStacks(exec, region);
    if (stacks === null) {
      err(`aws cloudformation list-stacks could not list the stacks in ${region}`);
      unreadable.push(region);
      counts.push(`${region}: not listed`);
      continue;
    }
    const old = stacks
      .filter((s) => s.StackStatus !== 'DELETE_COMPLETE' && TEST_STACK.test(s.StackName))
      .filter((s) => now() - Date.parse(s.CreationTime) > MAX_AGE_MS)
      .map((s) => ({ region, name: s.StackName, status: s.StackStatus, created: s.CreationTime }))
      .sort((a, b) => a.name.localeCompare(b.name));
    found.push(...old);
    counts.push(`${region}: ${old.length}`);
  }

  out('## Stacks left by example test runs');
  out('');
  out(`Stacks older than 24 hours whose names end in a test stage: ${found.length} (${counts.join(', ')}).`);
  if (found.length) {
    out('');
    out('| Region | Stack | Status | Created |');
    out('| --- | --- | --- | --- |');
    for (const s of found) out(`| ${s.region} | ${s.name} | ${s.status} | ${s.created} |`);
    out('');
    out('This report deletes nothing. Remove a stack with `serverless remove --stage <stage>` in its example, or delete it in CloudFormation.');
  }
  return unreadable.length ? 1 : 0;
}

// Resolves to the region's stack summaries, or null when they cannot be listed.
async function listStacks(exec, region) {
  const r = await exec('aws', ['cloudformation', 'list-stacks', '--region', region, '--output', 'json'], {
    step: 'list-stacks',
    echo: false,
    timeoutMs: LIST_TIMEOUT_MS,
  });
  if (r.status !== 0) return null;
  try {
    return JSON.parse(r.stdout).StackSummaries ?? [];
  } catch {
    return null;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await run(process.argv.slice(2));
}

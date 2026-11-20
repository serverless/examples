#!/usr/bin/env node
// Prints the examples a test run covers, as one JSON object on stdout:
//   { "dirs": [...], "quarantined": [...], "reason": "..." }
//
// Usage: node scripts/select-examples.mjs --changed <base-sha> [--tier fast|slow]
//        node scripts/select-examples.mjs --all --tier fast|slow
//
//   --changed <base-sha>  examples touched by `git diff --name-only --no-renames <base-sha>...HEAD`
//                         (both sides of a moved file count as changed)
//   --all                 every tested example in the tier
//   --tier                keep only examples in this tier
//
// Exits 1 with a message on stderr on a usage error, or when --all finds no
// tested example in the repository.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { findExampleDirs, loadManifest, TIERS } from './lib/manifest.mjs';
import { selectExamples } from './lib/select.mjs';

const USAGE = 'Usage: node scripts/select-examples.mjs --changed <base-sha> [--tier fast|slow] | --all --tier fast|slow';
const SHARED_FILES = 'scripts/shared-files.json';

const defaultExec = (cmd, args, opts) => execFileSync(cmd, args, { ...opts, encoding: 'utf8' });

/**
 * Runs the CLI with `args`; returns the exit code.
 * `exec(cmd, args, { cwd })` returns a command's stdout; it runs `git diff`.
 */
export function run(args, { root, exec = defaultExec, stdout = console.log, stderr = console.error } = {}) {
  const opts = parseArgs(args);
  if (opts.error) {
    stderr(opts.error);
    stderr(USAGE);
    return 1;
  }

  try {
    const manifests = findExampleDirs(root).map((dir) => loadManifest(root, dir));
    const sharedFile = path.join(root, SHARED_FILES);
    const sharedFiles = fs.existsSync(sharedFile) ? JSON.parse(fs.readFileSync(sharedFile, 'utf8')) : {};
    let changedFiles;
    if (opts.base) {
      const diff = exec('git', ['diff', '--name-only', '--no-renames', `${opts.base}...HEAD`], { cwd: root });
      changedFiles = diff.split('\n').map((l) => l.trim()).filter(Boolean);
      stderr(`${changedFiles.length} file(s) changed since ${opts.base}`);
    }
    const result = selectExamples({ manifests, sharedFiles, changedFiles, all: opts.all, tier: opts.tier });
    stdout(JSON.stringify(result));
    return 0;
  } catch (err) {
    stderr(err.message);
    return 1;
  }
}

function parseArgs(args) {
  const opts = { all: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--all') opts.all = true;
    else if (arg === '--changed' || arg === '--tier') {
      const value = args[++i];
      if (value === undefined || value.startsWith('--')) return { error: `${arg} needs a value` };
      if (arg === '--changed') opts.base = value;
      else opts.tier = value;
    } else return { error: `Unknown argument: ${arg}` };
  }
  if (opts.all === (opts.base !== undefined)) return { error: 'Pass either --changed <base-sha> or --all' };
  if (opts.all && opts.tier === undefined) return { error: '--all needs --tier' };
  if (opts.tier !== undefined && !TIERS.includes(opts.tier)) return { error: `--tier must be one of ${TIERS.join(', ')}` };
  return opts;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  process.exitCode = run(process.argv.slice(2), { root });
}

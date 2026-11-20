#!/usr/bin/env node
// Runs the static checks on examples that have an example.json manifest.
//
// Usage: node scripts/check-examples.mjs [--all | <dir>…] [--package]
//
//   --all      check every example with a manifest
//   <dir>…     check these example directories (relative to the repository root)
//   --package  also install dependencies and run `serverless package` in a
//              temporary copy of each example
//
// Prints one `<dir>: <message>` line per error and a final count; exits 1 on any error.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { findExampleDirs, MANIFEST_FILE } from './lib/manifest.mjs';
import { checkExample, packageExample } from './lib/static-checks.mjs';

const USAGE = 'Usage: node scripts/check-examples.mjs [--all | <dir>…] [--package]';

/** Runs the CLI with `args`; returns the exit code. `exec` is passed to packageExample. */
export function run(args, { root, exec, log = console.log } = {}) {
  const all = args.includes('--all');
  const pkg = args.includes('--package');
  const unknown = args.filter((a) => a.startsWith('--') && a !== '--all' && a !== '--package');
  const named = args.filter((a) => !a.startsWith('--'));
  if (unknown.length || all === (named.length > 0)) {
    if (unknown.length) log(`Unknown option: ${unknown.join(', ')}`);
    log(USAGE);
    return 1;
  }

  const dirs = all ? findExampleDirs(root) : named.map((d) => normalizeDir(root, d));
  if (dirs.length === 0) {
    log(`Found no examples with an ${MANIFEST_FILE} manifest`);
    return 0;
  }

  let errorCount = 0;
  for (const dir of dirs) {
    let errors;
    if (!fs.existsSync(path.join(root, dir, MANIFEST_FILE))) {
      errors = [`no ${MANIFEST_FILE} in this directory`];
    } else {
      errors = checkExample(root, dir);
      if (pkg) errors.push(...packageExample(root, dir, exec ? { exec } : {}));
    }
    for (const e of errors) log(`${dir}: ${e}`);
    errorCount += errors.length;
  }
  log(`Checked ${dirs.length} example(s), ${errorCount} error(s)`);
  return errorCount ? 1 : 0;
}

// Turns `./aws-node/`, `aws-node` or an absolute path into `aws-node`.
function normalizeDir(root, dir) {
  return path.relative(root, path.resolve(root, dir)).split(path.sep).join('/');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  process.exitCode = run(process.argv.slice(2), { root });
}

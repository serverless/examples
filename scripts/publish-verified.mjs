#!/usr/bin/env node
// Adds the live test results of one workflow run to the published record and
// writes the badges.
//
// Usage: node scripts/publish-verified.mjs --results-dir <dir> --out <dir> --run-url <url>
//
//   --results-dir <dir>  result files of scripts/test-example.mjs (*.json, searched
//                        recursively); only `latest` results count. A missing
//                        directory counts as no results.
//   --out <dir>          the published tree: reads results.json there when it
//                        exists, then writes results.json (the examples that ran)
//                        and badges/<example>.svg for every tested example of this
//                        checkout and every example in results.json (nested
//                        directories kept, such as badges/mcp/minimal.svg); an
//                        example that is not verified, never ran or is
//                        quarantined gets the empty 1x1 badge
//   --run-url <url>      the workflow run the results come from
//
// Results naming a directory that is not a tested example of this checkout are
// ignored. Quarantined examples lose their verification. Exits 0 on success,
// 2 on a usage error.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { findExampleDirs, loadManifest } from './lib/manifest.mjs';
import { badgePath, isSafeDir, mergeResults, renderBadge } from './lib/verified.mjs';

const USAGE = 'Usage: node scripts/publish-verified.mjs --results-dir <dir> --out <dir> --run-url <url>';
const RESULTS_FILE = 'results.json';

/** Runs the CLI with `args` against the examples under `root`; returns the exit code. */
export function run(args, { root, log = console.log } = {}) {
  let values;
  try {
    ({ values } = parseArgs({
      args,
      options: { 'results-dir': { type: 'string' }, out: { type: 'string' }, 'run-url': { type: 'string' } },
    }));
  } catch (err) {
    log(err.message);
    log(USAGE);
    return 2;
  }
  const missing = ['results-dir', 'out', 'run-url'].filter((k) => !values[k]);
  if (missing.length) {
    log(`missing ${missing.map((k) => `--${k}`).join(', ')}`);
    log(USAGE);
    return 2;
  }

  const tested = findExampleDirs(root)
    .map((dir) => loadManifest(root, dir))
    .filter((m) => m.test);
  const known = new Set(tested.map((m) => m.dir));
  const quarantined = tested.filter((m) => m.test.quarantine).map((m) => m.dir);

  const runs = [];
  for (const file of jsonFiles(values['results-dir'])) {
    const r = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!known.has(r.example)) {
      log(`${file}: ignored; ${JSON.stringify(r.example)} is not a tested example`);
      continue;
    }
    runs.push(r);
  }

  const out = values.out;
  const previousFile = path.join(out, RESULTS_FILE);
  const previous = fs.existsSync(previousFile) ? JSON.parse(fs.readFileSync(previousFile, 'utf8')) : {};
  for (const key of Object.keys(previous)) {
    if (!isSafeDir(key)) {
      log(`${previousFile}: ignored the entry ${JSON.stringify(key)}`);
      delete previous[key];
    }
  }

  const results = mergeResults(previous, runs, values['run-url'], { quarantined });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(previousFile, `${JSON.stringify(results, null, 2)}\n`);
  // Every tested example gets a badge, the empty one when it is not verified:
  // also one that never ran or is quarantined, so no README shows a missing image.
  for (const dir of new Set([...known, ...Object.keys(results)])) {
    const file = path.join(out, badgePath(dir));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, renderBadge(results[dir] ?? null));
  }
  const verified = Object.values(results).filter((e) => e.verified).length;
  log(`${runs.length} result(s) read; ${Object.keys(results).length} example(s) in ${RESULTS_FILE}, ${verified} verified`);
  return 0;
}

function jsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.json'))
    .map((e) => path.join(e.parentPath, e.name))
    .sort();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  process.exitCode = run(process.argv.slice(2), { root });
}

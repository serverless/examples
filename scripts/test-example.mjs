#!/usr/bin/env node
// Deploys one example to AWS with a unique stage, runs the checks its
// example.json declares, and always removes what it deployed.
//
// Usage: node scripts/test-example.mjs <dir> [--framework-version <v>] [--region <r>] [--result-file <path>]
//
//   <dir>                    example directory, relative to the repository root
//   --framework-version <v>  latest (default), canary, or a version number; anything
//                            but latest is written into frameworkVersion in a copy
//   --region <r>             AWS region; defaults to the manifest's region, then
//                            AWS_REGION, then AWS_DEFAULT_REGION, then us-east-1.
//                            Every serverless and aws command gets --region.
//   --result-file <path>     also write the result as JSON to this file
//
// AWS credentials and the Framework key come from the caller's environment.
// Command output streams to stderr, prefixed with the step name. Stdout gets one
// line: `PASS|FAIL <dir> <resolvedVersion> <seconds>s`, or
// `SKIP <dir> quarantined: <reason>` for a quarantined example.
// Exit code: 0 pass or skip, 1 a failed step (remove included), 2 usage or manifest error.
//
// On SIGINT or SIGTERM the current step stops, remove runs, the result records
// the stopped step as `interrupted`, and the exit code is 1. A second signal
// exits at once and names the stacks left behind.

import { randomInt } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleepFor } from 'node:timers/promises';
import { parseArgs } from 'node:util';

import { runCheck } from './lib/checks.mjs';
import { copyExample, installCommands, Interrupted, isComposeRoot, runCommand, runOrThrow, serviceDirs, TimedOut } from './lib/exec.mjs';
import { loadManifest, validateManifest, MANIFEST_FILE } from './lib/manifest.mjs';

const USAGE = 'Usage: node scripts/test-example.mjs <dir> [--framework-version <v>] [--region <r>] [--result-file <path>]';
const MINUTE = 60_000;
const DEFAULT_TIMEOUT_MINUTES = 15;
const DEFAULT_REGION = 'us-east-1';
const REMOVE_TIMEOUT_MS = 15 * MINUTE;
const VERSION_TIMEOUT_MS = 2 * MINUTE;
const SERVICE_FILES = ['serverless.yml', 'serverless.yaml'];
const FRAMEWORK_VERSION = /^(latest|canary|\d+(\.\d+){0,2}(-[0-9A-Za-z.]+)?)$/;
const STAGE_TIME_CHARS = 5;
const STAGE_RANDOM_CHARS = 4;

/** A problem with the command line or the example's manifest (exit code 2). */
export class UsageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UsageError';
  }
}

/**
 * @typedef {object} Result
 * @property {string} example           the example directory
 * @property {'fast'|'slow'} tier
 * @property {'pass'|'fail'|'skip'} result
 * @property {string} frameworkVersion  as requested: latest, canary or a number
 * @property {string} resolvedVersion   from `serverless --version`, or `unknown`
 * @property {string|null} stage        null for a skipped example
 * @property {string} region            the region every command used
 * @property {string} startedAt         ISO 8601
 * @property {number} durationSeconds
 * @property {'install'|'deploy'|'check'|'remove'} [failedStep]  the first step that did not complete
 * @property {string} [detail]          what went wrong, or why the example was skipped
 * @property {string} [leftBehind]      stacks a failed remove may have left, comma-separated
 */

/** Returns a stage name: `ex` + 9 lowercase base36 characters (time, then random). */
export function newStage(now = Date.now()) {
  const time = (now % 36 ** STAGE_TIME_CHARS).toString(36).padStart(STAGE_TIME_CHARS, '0');
  let random = '';
  for (let i = 0; i < STAGE_RANDOM_CHARS; i++) random += randomInt(36).toString(36);
  return `ex${time}${random}`;
}

/**
 * Copies the example at `<root>/<dir>` to a temporary directory, installs its
 * dependencies, deploys it with a new stage, reads the stack outputs, runs the
 * manifest's checks and removes the deployment. Every external command goes
 * through `exec` (signature of runCommand), HTTP through `fetchImpl`. The
 * region is `region`, else the manifest's, else AWS_REGION or
 * AWS_DEFAULT_REGION from `env`, else us-east-1. When `signal` aborts, the
 * current step stops and is recorded as interrupted, and remove still runs
 * (without that signal). `onDeployStart(stacks)` is called just before deploy.
 * Throws UsageError for a manifest the runner cannot run; otherwise resolves
 * to a Result, also written to `resultFile` when given.
 */
export async function runExample({
  root,
  dir,
  frameworkVersion = 'latest',
  region,
  exec = runCommand,
  fetchImpl = fetch,
  now = Date.now,
  sleep = (ms) => sleepFor(ms, undefined, { signal }).catch(() => {}),
  log = (line) => process.stderr.write(`${line}\n`),
  resultFile,
  signal,
  env = process.env,
  onDeployStart = () => {},
}) {
  if (!FRAMEWORK_VERSION.test(frameworkVersion)) {
    throw new UsageError(`--framework-version ${JSON.stringify(frameworkVersion)}: use latest, canary or a version number such as 4.4.7`);
  }
  const manifest = readTestedManifest(root, dir);
  region ??= manifest.region ?? (env.AWS_REGION || undefined) ?? (env.AWS_DEFAULT_REGION || undefined) ?? DEFAULT_REGION;
  const startMs = now();
  const base = { example: dir, tier: manifest.test.tier, frameworkVersion, startedAt: new Date(startMs).toISOString() };
  const finish = (result) => {
    if (resultFile) {
      fs.mkdirSync(path.dirname(path.resolve(resultFile)), { recursive: true });
      fs.writeFileSync(resultFile, `${JSON.stringify(result, null, 2)}\n`);
    }
    return result;
  };

  if (manifest.test.quarantine) {
    return finish({
      ...base,
      result: 'skip',
      resolvedVersion: 'unknown',
      stage: null,
      region,
      durationSeconds: 0,
      detail: `quarantined: ${manifest.test.quarantine.reason}`,
    });
  }

  const exampleDir = path.join(root, dir);
  const compose = isComposeRoot(exampleDir);
  if (compose) {
    const other = manifest.test.checks.map((c, i) => [i, Object.keys(c)[0]]).filter(([, kind]) => kind !== 'script');
    if (other.length) {
      throw new UsageError(
        `${dir}: a Compose root has no single stack to read outputs from, so only script checks can run; ` +
          `test.checks${other.map(([i, kind]) => `[${i}] is ${kind}`).join(', ')}`,
      );
    }
  }
  const services = (compose ? serviceDirs(exampleDir) : [exampleDir]).filter((d) => findServiceFile(d));
  const serviceNames = services.map((d) => readServiceName(root, d));

  const stage = newStage(startMs);
  const stacks = serviceNames.map((name) => `${name}-${stage}`);
  const regionArgs = ['--region', region];
  const deadline = startMs + (manifest.test.timeoutMinutes ?? DEFAULT_TIMEOUT_MINUTES) * MINUTE;
  const left = () => deadline - now();
  log(`[run] ${dir}: stage ${stage}, region ${region}, framework ${frameworkVersion}`);

  const failure = {};
  const attempt = async (step, fn) => {
    if (failure.step) return;
    try {
      await fn();
    } catch (err) {
      failure.step = step;
      failure.detail = err.message;
      log(`[${step}] ${failure.detail}`);
    }
  };

  const { copy, cleanup } = copyExample(root, dir, 'example-run-');
  let deployStarted = false;
  let resolvedVersion = 'unknown';
  let leftBehind;
  try {
    try {
      if (frameworkVersion !== 'latest') {
        const dirs = compose ? serviceDirs(copy) : [copy];
        for (const d of dirs) rewriteFrameworkVersion(d, frameworkVersion);
      }
      resolvedVersion = await readFrameworkVersion(exec, copy, Math.min(VERSION_TIMEOUT_MS, left()), signal);

      await attempt('install', async () => {
        for (const { cwd, cmd, args } of installCommands(copy)) {
          await runOrThrow(exec, cmd, args, { cwd, step: 'install', timeoutMs: left(), signal });
        }
      });

      await attempt('deploy', () => {
        deployStarted = true;
        onDeployStart(stacks);
        return runOrThrow(exec, 'serverless', ['deploy', '--stage', stage, ...regionArgs], {
          cwd: copy,
          step: 'deploy',
          timeoutMs: left(),
          signal,
        });
      });

      await attempt('check', async () => {
        const outputs = compose ? {} : await readOutputs(exec, copy, stacks[0], region, left(), signal);
        const ctx = { cwd: copy, stage, region, outputs, exec, fetchImpl, now, sleep, deadline, signal };
        for (const [i, check] of manifest.test.checks.entries()) {
          const kind = Object.keys(check)[0];
          log(`[check] checks[${i}] ${kind}`);
          try {
            await runCheck(check, ctx);
          } catch (err) {
            if (err instanceof TimedOut || err instanceof Interrupted) throw err;
            throw new Error(`checks[${i}] ${kind}: ${err.message}`);
          }
        }
      });
    } finally {
      if (deployStarted) {
        try {
          await runOrThrow(exec, 'serverless', ['remove', '--stage', stage, ...regionArgs], {
            cwd: copy,
            step: 'remove',
            timeoutMs: REMOVE_TIMEOUT_MS,
          });
          if (signal?.aborted && !failure.step) {
            failure.step = 'remove';
            failure.detail = new Interrupted().message;
          }
        } catch (err) {
          const detail = err.message;
          log(`[remove] ${detail}`);
          leftBehind = stacks.join(', ');
          if (failure.step) {
            failure.detail += `; remove: ${detail}`;
          } else {
            failure.step = 'remove';
            failure.detail = detail;
          }
        }
      }
    }
  } finally {
    cleanup();
  }

  const result = {
    ...base,
    result: failure.step ? 'fail' : 'pass',
    resolvedVersion,
    stage,
    region,
    durationSeconds: Math.round((now() - startMs) / 1000),
  };
  if (failure.step) Object.assign(result, { failedStep: failure.step, detail: failure.detail });
  if (leftBehind) result.leftBehind = leftBehind;
  return finish(result);
}

function readTestedManifest(root, dir) {
  if (!fs.existsSync(path.join(root, dir, MANIFEST_FILE))) throw new UsageError(`${dir}: no ${MANIFEST_FILE} in this directory`);
  let manifest;
  try {
    manifest = loadManifest(root, dir);
  } catch (err) {
    throw new UsageError(err.message);
  }
  const problems = validateManifest(manifest);
  if (problems.length) throw new UsageError(`${dir}/${MANIFEST_FILE}: ${problems.join('; ')}`);
  if (!manifest.test) throw new UsageError(`${dir}/${MANIFEST_FILE} has no test section; only tested examples can run`);
  return manifest;
}

function findServiceFile(dir) {
  return SERVICE_FILES.map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
}

// Line-based: reads the top-level `service:` line.
function readServiceName(root, dir) {
  const file = findServiceFile(dir);
  const rel = path.relative(root, file).split(path.sep).join('/');
  const line = fs.readFileSync(file, 'utf8').match(/^service[ \t]*:[ \t]*(.*)$/m)?.[1] ?? '';
  const name = line
    .replace(/\s+#.*$/, '')
    .trim()
    .replace(/^(['"])(.*)\1$/, '$2');
  if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(name)) {
    throw new UsageError(`${rel}: the service: line must hold a plain service name to derive the stack name; found ${JSON.stringify(line.trim())}`);
  }
  return name;
}

// Replaces the top-level frameworkVersion line, or adds one at the top.
function rewriteFrameworkVersion(dir, version) {
  const file = findServiceFile(dir);
  if (!file) return;
  const text = fs.readFileSync(file, 'utf8');
  const line = `frameworkVersion: '${version}'`;
  const pattern = /^frameworkVersion[ \t]*:.*$/m;
  fs.writeFileSync(file, pattern.test(text) ? text.replace(pattern, line) : `${line}\n${text}`);
}

async function readFrameworkVersion(exec, cwd, timeoutMs, signal) {
  try {
    const r = await runOrThrow(exec, 'serverless', ['--version'], { cwd, step: 'version', timeoutMs, signal });
    const text = `${r.stdout ?? ''}\n${r.stderr ?? ''}`;
    const version = /(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/;
    const line = text.split('\n').find((l) => /framework/i.test(l) && version.test(l)) ?? text;
    return line.match(version)?.[1] ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

async function readOutputs(exec, cwd, stack, region, timeoutMs, signal) {
  const args = ['cloudformation', 'describe-stacks', '--stack-name', stack, '--region', region, '--output', 'json'];
  let r;
  try {
    r = await runOrThrow(exec, 'aws', args, { cwd, step: 'outputs', echo: false, timeoutMs, signal });
  } catch (err) {
    if (err instanceof TimedOut || err instanceof Interrupted) throw err;
    throw new Error(`could not read the stack outputs of ${stack}: ${err.message}`);
  }
  let outputs;
  try {
    outputs = JSON.parse(r.stdout).Stacks[0].Outputs ?? [];
  } catch (err) {
    throw new Error(`could not read the stack outputs of ${stack}: ${err.message}`);
  }
  return Object.fromEntries(outputs.map((o) => [o.OutputKey, o.OutputValue]));
}

/**
 * Runs the CLI with `argv`; resolves to the exit code. SIGINT and SIGTERM from
 * `signals` (default: process) interrupt the run; a second one calls `exit(1)`.
 * Other deps go to runExample.
 */
export async function main(
  argv,
  { root, out = console.log, err = (line) => process.stderr.write(`${line}\n`), signals = process, exit = (code) => process.exit(code), ...deps } = {},
) {
  const controller = new AbortController();
  let deployed = [];
  let received = 0;
  const onSignal = (name) => {
    received += 1;
    if (received === 1) {
      err(`[run] ${name}: stopping the current step; removing what was deployed (send it again to exit at once)`);
      controller.abort();
      return;
    }
    err(`[run] ${name} again: exiting without waiting for remove`);
    if (deployed.length) err(`left behind: ${deployed.join(', ')}`);
    exit(1);
  };
  const handlers = { SIGINT: () => onSignal('SIGINT'), SIGTERM: () => onSignal('SIGTERM') };
  for (const [name, handler] of Object.entries(handlers)) signals.on(name, handler);
  try {
    let parsed;
    try {
      parsed = parseArgs({
        args: argv,
        allowPositionals: true,
        options: {
          'framework-version': { type: 'string' },
          region: { type: 'string' },
          'result-file': { type: 'string' },
        },
      });
    } catch (e) {
      throw new UsageError(e.message);
    }
    if (parsed.positionals.length !== 1) throw new UsageError('give exactly one example directory');
    const dir = path.relative(root, path.resolve(root, parsed.positionals[0])).split(path.sep).join('/');
    const { values } = parsed;

    const result = await runExample({
      root,
      dir,
      frameworkVersion: values['framework-version'],
      region: values.region,
      resultFile: values['result-file'],
      log: err,
      signal: controller.signal,
      onDeployStart: (stacks) => {
        deployed = stacks;
      },
      ...deps,
    });
    if (result.result === 'skip') {
      out(`SKIP ${dir} ${result.detail}`);
      return 0;
    }
    if (result.failedStep) err(`failed step: ${result.failedStep}: ${result.detail}`);
    if (result.leftBehind) err(`left behind: ${result.leftBehind}`);
    out(`${result.result === 'pass' ? 'PASS' : 'FAIL'} ${dir} ${result.resolvedVersion} ${result.durationSeconds}s`);
    return result.result === 'pass' ? 0 : 1;
  } catch (e) {
    if (!(e instanceof UsageError)) throw e;
    err(e.message);
    err(USAGE);
    return 2;
  } finally {
    for (const [name, handler] of Object.entries(handlers)) signals.off(name, handler);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  process.exitCode = await main(process.argv.slice(2), { root });
}

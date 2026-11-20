#!/usr/bin/env node
// Deploys one example to AWS with a unique stage, runs the checks its
// example.json declares, and always removes what it deployed.
//
// Usage: node scripts/test-example.mjs <dir> [--framework-version <v>] [--region <r>] [--result-file <path>]
//                                            [--stage <stage>] [--remove-only]
//
//   <dir>                    example directory, relative to the repository root
//   --framework-version <v>  latest (default), canary, or a version number; anything
//                            but latest is written into frameworkVersion in a copy
//   --region <r>             AWS region; defaults to the manifest's region, then
//                            AWS_REGION, then AWS_DEFAULT_REGION, then us-east-1.
//                            Every serverless and aws command gets --region.
//   --result-file <path>     also write the result as JSON to this file
//   --stage <stage>          use this stage instead of a new one: `ex` + 1 to 13
//                            lowercase base36 characters
//   --remove-only            with --stage: deploy nothing, only remove what that
//                            stage deployed. Lists the region's stacks whose names
//                            end in `-<stage>`; when there are none it removes
//                            nothing and passes; otherwise it installs dependencies
//                            where serverless.yml loads plugins and runs
//                            `serverless remove --stage <stage>`.
//
// When `serverless remove` exits non-zero, the stage's stacks decide: the runner
// waits (at most 10 minutes, within remove's own 15) while they are being
// deleted, runs remove once more when they settle in a state that is not
// deleting, and counts remove as done once every stack is gone. It stops early
// when the stacks cannot be listed 3 times in a row, or when they have settled
// again after that retry.
//
// AWS credentials and the Framework key come from the caller's environment.
// Command output streams to stderr, prefixed with the step name. Stdout gets one
// line: `PASS|FAIL <dir> <resolvedVersion> <seconds>s`, or
// `SKIP <dir> quarantined: <reason>` for a quarantined example.
// Exit code: 0 pass or skip, 1 a failed step (remove included), 2 usage or manifest error.
//
// On SIGINT or SIGTERM the current step stops, remove runs, the result records
// the stopped step as `interrupted`, and the exit code is 1. A second signal
// kills every running command's process group, exits at once and names the
// stacks left behind. With --remove-only a first signal does not stop the remove.

import { randomInt } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleepFor } from 'node:timers/promises';
import { parseArgs } from 'node:util';

import { runCheck } from './lib/checks.mjs';
import {
  copyExample,
  installCommands,
  Interrupted,
  isComposeRoot,
  runCommand,
  runOrThrow,
  serviceDirs,
  stopAllCommands,
  TimedOut,
} from './lib/exec.mjs';
import { loadManifest, validateManifest, MANIFEST_FILE } from './lib/manifest.mjs';

const USAGE =
  'Usage: node scripts/test-example.mjs <dir> [--framework-version <v>] [--region <r>] [--result-file <path>] [--stage <stage>] [--remove-only]';
const MINUTE = 60_000;
const DEFAULT_TIMEOUT_MINUTES = 15;
const DEFAULT_REGION = 'us-east-1';
const REMOVE_TIMEOUT_MS = 15 * MINUTE;
const VERSION_TIMEOUT_MS = 2 * MINUTE;
// After a remove that exits non-zero: how often and how long to watch the stage's stacks.
const REMOVE_POLL_MS = 10_000;
const REMOVE_WAIT_MS = 10 * MINUTE;
const MAX_FAILED_LISTINGS = 3;
const SERVICE_FILES = ['serverless.yml', 'serverless.yaml'];
const FRAMEWORK_VERSION = /^(latest|canary|\d+(\.\d+){0,2}(-[0-9A-Za-z.]+)?)$/;
const STAGE_TIME_CHARS = 5;
const STAGE_RANDOM_CHARS = 4;
const STAGE = /^ex[a-z0-9]{1,13}$/;
const PLUGINS_LINE = /^plugins[ \t]*:/m;
// `Framework <version>` in `serverless --version`: a release (4.46.0) or a canary build id (52f2ef5).
const FRAMEWORK_LINE = /Framework\s+v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?|[0-9a-f]{7,40})(?![0-9A-Za-z.-])/;

/** CloudFormation stack statuses of a stack that still exists: every status except DELETE_COMPLETE. */
export const EXISTING_STACK_STATUSES = [
  'CREATE_IN_PROGRESS',
  'CREATE_FAILED',
  'CREATE_COMPLETE',
  'ROLLBACK_IN_PROGRESS',
  'ROLLBACK_FAILED',
  'ROLLBACK_COMPLETE',
  'DELETE_IN_PROGRESS',
  'DELETE_FAILED',
  'UPDATE_IN_PROGRESS',
  'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
  'UPDATE_COMPLETE',
  'UPDATE_FAILED',
  'UPDATE_ROLLBACK_IN_PROGRESS',
  'UPDATE_ROLLBACK_FAILED',
  'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
  'UPDATE_ROLLBACK_COMPLETE',
  'REVIEW_IN_PROGRESS',
  'IMPORT_IN_PROGRESS',
  'IMPORT_COMPLETE',
  'IMPORT_ROLLBACK_IN_PROGRESS',
  'IMPORT_ROLLBACK_FAILED',
  'IMPORT_ROLLBACK_COMPLETE',
];

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
 * In `detail` and `leftBehind` every 12-digit number reads 123456789012.
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
 * `stage` replaces the generated stage. Throws UsageError for a manifest the
 * runner cannot run; otherwise resolves to a Result, also written to
 * `resultFile` when given.
 */
export async function runExample({
  root,
  dir,
  frameworkVersion = 'latest',
  region,
  stage: givenStage,
  exec = runCommand,
  fetchImpl = fetch,
  now = Date.now,
  sleep = (ms) => sleepFor(ms),
  log = (line) => process.stderr.write(`${line}\n`),
  resultFile,
  signal,
  env = process.env,
  onDeployStart = () => {},
}) {
  checkVersionAndStage(frameworkVersion, givenStage);
  const manifest = readTestedManifest(root, dir);
  region ??= manifest.region ?? (env.AWS_REGION || undefined) ?? (env.AWS_DEFAULT_REGION || undefined) ?? DEFAULT_REGION;
  const startMs = now();
  const base = { example: dir, tier: manifest.test.tier, frameworkVersion, startedAt: new Date(startMs).toISOString() };
  const finish = (result) => {
    maskAccountIds(result);
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

  const stage = givenStage ?? newStage(startMs);
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
        const ctx = { cwd: copy, stage, region, outputs, exec, fetchImpl, now, sleep: untilAborted(sleep, signal), deadline, signal };
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
        const removal = await removeStage({ exec, cwd: copy, stage, region, deadline: now() + REMOVE_TIMEOUT_MS, sleep, now, log });
        if (removal.done) {
          if (signal?.aborted && !failure.step) {
            failure.step = 'remove';
            failure.detail = new Interrupted().message;
          }
        } else {
          const detail = removal.error;
          leftBehind = (removal.left ?? stacks).join(', ');
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

/**
 * Removes what `stage` deployed from the example at `<root>/<dir>`, without
 * deploying: copies the example, lists the region's stacks and, when one ends
 * in `-<stage>`, installs dependencies where a serverless.yml loads plugins and
 * runs `serverless remove`. Nothing deployed is a pass with the detail
 * `nothing deployed`. When the stacks cannot be listed, remove runs anyway.
 * The region is chosen as in runExample. Resolves to a Result.
 */
export async function removeOnly({
  root,
  dir,
  stage,
  frameworkVersion = 'latest',
  region,
  exec = runCommand,
  now = Date.now,
  sleep = (ms) => sleepFor(ms),
  log = (line) => process.stderr.write(`${line}\n`),
  resultFile,
  env = process.env,
}) {
  if (stage === undefined) throw new UsageError('--remove-only needs --stage <stage>');
  checkVersionAndStage(frameworkVersion, stage);
  const manifest = readTestedManifest(root, dir);
  region ??= manifest.region ?? (env.AWS_REGION || undefined) ?? (env.AWS_DEFAULT_REGION || undefined) ?? DEFAULT_REGION;
  const startMs = now();
  log(`[remove-only] ${dir}: stage ${stage}, region ${region}`);

  const { copy, cleanup } = copyExample(root, dir, 'example-remove-');
  const result = {
    example: dir,
    tier: manifest.test.tier,
    frameworkVersion,
    startedAt: new Date(startMs).toISOString(),
    result: 'pass',
    resolvedVersion: 'unknown',
    stage,
    region,
  };
  try {
    const compose = isComposeRoot(copy);
    const dirs = compose ? serviceDirs(copy) : [copy];
    if (frameworkVersion !== 'latest') for (const d of dirs) rewriteFrameworkVersion(d, frameworkVersion);

    const listed = await listStageStacks(exec, copy, stage, region);
    if (listed.error) log(`[list-stacks] could not list the stacks in ${region} (${listed.error}); running remove anyway`);
    const stacks = listed.stacks?.map((s) => s.name);
    const fallback = stacks?.join(', ') || `stacks ending in -${stage}`;
    if (stacks?.length === 0) {
      log(`[remove-only] no stack in ${region} ends in -${stage}; nothing to remove`);
      result.detail = 'nothing deployed';
    } else {
      let removal;
      try {
        const withPlugins = new Set(dirs.filter(loadsPlugins));
        for (const { cwd, cmd, args } of installCommands(copy).filter((c) => withPlugins.has(c.cwd))) {
          await runOrThrow(exec, cmd, args, { cwd, step: 'install', timeoutMs: REMOVE_TIMEOUT_MS });
        }
        removal = await removeStage({ exec, cwd: copy, stage, region, deadline: now() + REMOVE_TIMEOUT_MS, sleep, now, log });
      } catch (err) {
        log(`[install] ${err.message}`);
        removal = { done: false, error: err.message, left: null };
      }
      if (removal.done && removal.error) {
        result.detail = `the stacks of stage ${stage} are gone; serverless remove had reported an error: ${removal.lastLine}`;
      } else if (!removal.done) {
        Object.assign(result, {
          result: 'fail',
          failedStep: 'remove',
          detail: removal.error,
          leftBehind: removal.left?.join(', ') || fallback,
        });
      }
    }
  } finally {
    cleanup();
  }
  result.durationSeconds = Math.round((now() - startMs) / 1000);
  maskAccountIds(result);
  if (resultFile) {
    fs.mkdirSync(path.dirname(path.resolve(resultFile)), { recursive: true });
    fs.writeFileSync(resultFile, `${JSON.stringify(result, null, 2)}\n`);
  }
  return result;
}

// Result files are uploaded as artifacts of a public repository, and AWS error
// messages quoted in `detail` can name the account: every 12-digit number in
// `detail` and `leftBehind` becomes the placeholder account id. Changes `result`.
function maskAccountIds(result) {
  for (const key of ['detail', 'leftBehind']) {
    if (typeof result[key] === 'string') result[key] = result[key].replace(/\b\d{12}\b/g, '123456789012');
  }
}

// True when the service in `dir` has a top-level plugins: key.
function loadsPlugins(dir) {
  const file = findServiceFile(dir);
  return Boolean(file) && PLUGINS_LINE.test(fs.readFileSync(file, 'utf8'));
}

// Resolves to `{ stacks }`, the `{ name, status }` of each of the region's
// stacks (not deleted) whose name ends in `-<stage>`, or to `{ error }`, one
// line saying why they could not be listed (account ids masked).
async function listStageStacks(exec, cwd, stage, region, timeoutMs = VERSION_TIMEOUT_MS) {
  const args = ['cloudformation', 'list-stacks', '--region', region, '--output', 'json', '--stack-status-filter', ...EXISTING_STACK_STATUSES];
  try {
    const r = await runOrThrow(exec, 'aws', args, { cwd, step: 'list-stacks', echo: false, timeoutMs });
    const stacks = JSON.parse(r.stdout)
      .StackSummaries.filter((s) => s.StackStatus !== 'DELETE_COMPLETE' && s.StackName.endsWith(`-${stage}`))
      .map((s) => ({ name: s.StackName, status: s.StackStatus }));
    return { stacks };
  } catch (err) {
    const line = lastOutputLine(err.result) ?? err.message;
    return { error: line.replace(/\b\d{12}\b/g, '<account>') };
  }
}

/**
 * Runs `serverless remove` for `stage` in `cwd` and decides from the stage's
 * stacks whether the removal is done. A remove that exits 0 is done. After a
 * non-zero exit the stacks ending in `-<stage>` are listed:
 * - none left: done;
 * - one still in progress (DELETE_IN_PROGRESS among others): wait 10 s, list again;
 * - every remaining stack settled in a state that is not deleting: run remove
 *   once more (one retry in total), then list again; once the retry is spent,
 *   stop, since nothing can change those stacks any more;
 * - 3 listings in a row that do not succeed: stop, with the stacks unknown.
 * Waiting stops after 10 minutes and never runs past `deadline`; no listing gets
 * more time than is left to it. Resolves to `{ done, error, lastLine, left }`:
 * `error` is the first remove's error message, `lastLine` its error line,
 * `left` the names of the stacks still present when not done (null when unknown).
 */
async function removeStage({ exec, cwd, stage, region, deadline, sleep, now, log }) {
  const remove = () =>
    runOrThrow(exec, 'serverless', ['remove', '--stage', stage, '--region', region], { cwd, step: 'remove', timeoutMs: deadline - now() });
  let first;
  try {
    await remove();
    return { done: true };
  } catch (err) {
    first = err;
  }
  log(`[remove] ${first.message}`);
  const error = first.message;
  const lastLine = errorLine(first.result) ?? error;
  const waitUntil = Math.min(now() + REMOVE_WAIT_MS, deadline);
  const describe = (stacks) => stacks.map((s) => `${s.name} (${s.status})`).join(', ');
  const stop = (left) => {
    log(`[remove] stopped waiting; still present: ${left ? left.join(', ') : `unknown (the stacks ending in -${stage} could not be listed)`}`);
    return { done: false, error, lastLine, left };
  };
  let retried = false;
  let left = null;
  let failedListings = 0;
  for (;;) {
    const listed = await listStageStacks(exec, cwd, stage, region, Math.min(VERSION_TIMEOUT_MS, deadline - now()));
    const { stacks } = listed;
    if (stacks) {
      failedListings = 0;
      if (stacks.length === 0) {
        log(`[remove] every stack of stage ${stage} is gone`);
        return { done: true, error, lastLine };
      }
      left = stacks.map((s) => s.name);
    } else {
      failedListings += 1;
      log(`[remove] could not list the stacks of stage ${stage} (${failedListings} of ${MAX_FAILED_LISTINGS} in a row): ${listed.error}`);
      if (failedListings >= MAX_FAILED_LISTINGS) return stop(null);
    }
    if (now() >= waitUntil) return stop(left);
    const settled = stacks?.every((s) => !s.status.endsWith('_IN_PROGRESS'));
    if (settled && retried) {
      log(`[remove] ${describe(stacks)} settled without being deleted after the retry`);
      return stop(left);
    }
    if (settled) {
      retried = true;
      log(`[remove] ${describe(stacks)} settled without being deleted; running serverless remove once more`);
      try {
        await remove();
      } catch (err) {
        log(`[remove] ${err.message}`);
      }
      continue;
    }
    const what = stacks ? `${describe(stacks)} to be deleted` : `a listing of the stacks ending in -${stage}`;
    log(`[remove] waiting for ${what}; checking again in ${REMOVE_POLL_MS / 1000}s`);
    await sleep(Math.min(REMOVE_POLL_MS, waitUntil - now()));
  }
}

// The Serverless Framework marks its error line with ✖: the last such line of
// stderr, else stdout, without the mark; else the last non-empty line.
function errorLine(result) {
  for (const text of [result?.stderr, result?.stdout]) {
    const marked = lines(text).filter((l) => l.startsWith('✖')).at(-1);
    if (marked) return marked.slice(1).trim();
  }
  return lastOutputLine(result);
}

// The last non-empty line of a command's stderr, else of its stdout, trimmed
// and without terminal colour codes; undefined when there is none.
function lastOutputLine(result) {
  for (const text of [result?.stderr, result?.stdout]) {
    const line = lines(text).at(-1);
    if (line) return line;
  }
  return undefined;
}

// The non-empty lines of `text`, trimmed, without terminal colour codes.
function lines(text) {
  return (text ?? '')
    .replace(/\x1b\[[0-9;]*m/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

// A sleep that ends early when `signal` aborts, for steps that stop on an interruption.
function untilAborted(sleep, signal) {
  return (ms) => {
    if (!signal) return sleep(ms);
    if (signal.aborted) return Promise.resolve();
    let onAbort;
    const aborted = new Promise((resolve) => {
      onAbort = resolve;
      signal.addEventListener('abort', onAbort, { once: true });
    });
    return Promise.race([sleep(ms), aborted]).finally(() => signal.removeEventListener('abort', onAbort));
  };
}

function checkVersionAndStage(frameworkVersion, stage) {
  if (!FRAMEWORK_VERSION.test(frameworkVersion)) {
    throw new UsageError(`--framework-version ${JSON.stringify(frameworkVersion)}: use latest, canary or a version number such as 4.4.7`);
  }
  if (stage !== undefined && !STAGE.test(stage)) {
    throw new UsageError(`--stage ${JSON.stringify(stage)}: use ex followed by 1 to 13 lowercase letters or digits`);
  }
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
    // The last matching line of stdout followed by stderr. When the CLI installs a
    // version first, its `Installed Serverless Framework v<v>` line (stderr) and the
    // `Serverless ϟ Framework <v>` line (stdout) name the same version, so either is right.
    const found = text
      .split('\n')
      .map((l) => l.match(FRAMEWORK_LINE)?.[1])
      .filter(Boolean);
    return found.at(-1) ?? 'unknown';
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
 * `signals` (default: process) interrupt the run; a second one calls
 * `stopCommands('SIGKILL')` (default: stopAllCommands) and then `exit(1)`.
 * Other deps go to runExample.
 */
export async function main(
  argv,
  {
    root,
    out = console.log,
    err = (line) => process.stderr.write(`${line}\n`),
    signals = process,
    exit = (code) => process.exit(code),
    stopCommands = stopAllCommands,
    ...deps
  } = {},
) {
  const controller = new AbortController();
  let deployed = [];
  let removing = false;
  let received = 0;
  const onSignal = (name) => {
    received += 1;
    if (received === 1) {
      err(
        removing
          ? `[run] ${name}: remove continues (send it again to exit at once)`
          : `[run] ${name}: stopping the current step; removing what was deployed (send it again to exit at once)`,
      );
      controller.abort();
      return;
    }
    err(`[run] ${name} again: killing the running commands and exiting without waiting for remove`);
    if (deployed.length) err(`left behind: ${deployed.join(', ')}`);
    stopCommands('SIGKILL');
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
          stage: { type: 'string' },
          'remove-only': { type: 'boolean' },
        },
      });
    } catch (e) {
      throw new UsageError(e.message);
    }
    if (parsed.positionals.length !== 1) throw new UsageError('give exactly one example directory');
    const dir = path.relative(root, path.resolve(root, parsed.positionals[0])).split(path.sep).join('/');
    const { values } = parsed;

    let result;
    if (values['remove-only']) {
      removing = true;
      deployed = [`the stacks ending in -${values.stage}`];
      result = await removeOnly({
        root,
        dir,
        stage: values.stage,
        frameworkVersion: values['framework-version'],
        region: values.region,
        resultFile: values['result-file'],
        log: err,
        ...deps,
      });
    } else result = await runExample({
      root,
      dir,
      frameworkVersion: values['framework-version'],
      region: values.region,
      stage: values.stage,
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

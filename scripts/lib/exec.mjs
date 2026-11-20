// One way to copy an example to a temporary directory, one way to decide how
// to install its dependencies, and one way to run a command in it.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Left out of every copy: they are rebuilt by the install and deploy steps.
const COPY_SKIP = new Set(['node_modules', '.serverless']);
// The lockfiles `npm ci` installs from.
const NPM_CI_LOCKFILES = ['package-lock.json', 'npm-shrinkwrap.json'];
export const COMPOSE_FILES = ['serverless-compose.yml', 'serverless-compose.yaml'];
// How long a killed command gets between SIGTERM and SIGKILL.
const KILL_GRACE_MS = 10_000;
// Every command started by runCommand whose process group may still hold
// processes: removed when it exits on its own, or after its SIGKILL.
const liveGroups = new Set();

/** Raised when a step is stopped by an interruption; its message is the step's detail. */
export class Interrupted extends Error {
  constructor() {
    super('interrupted');
    this.name = 'Interrupted';
  }
}

/** Raised when a step runs out of time; its message is the step's detail. */
export class TimedOut extends Error {
  constructor() {
    super('timed out');
    this.name = 'TimedOut';
  }
}

/**
 * Copies `<root>/<dir>` (without node_modules and .serverless) into a new
 * temporary directory. Returns the copy's path and a function that deletes
 * the temporary directory.
 */
export function copyExample(root, dir, prefix = 'example-') {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const copy = path.join(tmp, path.posix.basename(dir));
  fs.cpSync(path.join(root, dir), copy, {
    recursive: true,
    filter: (src) => !COPY_SKIP.has(path.basename(src)),
  });
  return { copy, cleanup: () => fs.rmSync(tmp, { recursive: true, force: true }) };
}

/** True when `dir` is a Serverless Framework Compose root. */
export function isComposeRoot(dir) {
  return COMPOSE_FILES.some((f) => fs.existsSync(path.join(dir, f)));
}

/**
 * Returns the directories under `dir` that hold a service: `dir` itself for a
 * single service, or each first-level directory for a Compose root.
 */
export function serviceDirs(dir) {
  if (!isComposeRoot(dir)) return [dir];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !COPY_SKIP.has(e.name) && !e.name.startsWith('.'))
    .map((e) => path.join(dir, e.name))
    .sort();
}

/**
 * Returns the install commands for the example at `dir`, in order:
 * `npm ci` where an npm lockfile exists, `npm install` where only a
 * package.json exists, in `dir` and, for a Compose root, in each first-level
 * service directory. Each entry is `{ cwd, cmd, args }`.
 */
export function installCommands(dir) {
  const dirs = isComposeRoot(dir) ? [dir, ...serviceDirs(dir)] : [dir];
  return dirs
    .filter((d) => fs.existsSync(path.join(d, 'package.json')))
    .map((d) => {
      const locked = NPM_CI_LOCKFILES.some((f) => fs.existsSync(path.join(d, f)));
      return { cwd: d, cmd: 'npm', args: [locked ? 'ci' : 'install'] };
    });
}

/**
 * Runs `cmd args` without a shell and resolves when it exits:
 * `{ status, stdout, stderr, timedOut, interrupted, error }`. `status` is null
 * when the command could not start (`error` set) or was stopped. Output is
 * captured and, unless `echo` is false, written line by line to `write` with a
 * `[step]` prefix. The command runs in its own process group. After
 * `timeoutMs`, or when `signal` aborts, the whole group (the command and every
 * process it started) is sent SIGTERM, then SIGKILL, and `timedOut` or
 * `interrupted` is true. `env` defaults to the caller's environment and is
 * never printed.
 */
export function runCommand(
  cmd,
  args,
  { cwd, env, timeoutMs, signal, step = cmd, echo = true, write = (s) => process.stderr.write(s) } = {},
) {
  return new Promise((resolve) => {
    const out = { stdout: '', stderr: '' };
    let timedOut = false;
    let interrupted = false;
    let error;
    let child;
    if (signal?.aborted) {
      resolve({ status: null, stdout: '', stderr: '', timedOut, interrupted: true });
      return;
    }
    try {
      // detached: a new process group, so a stop reaches the CLI's own child processes too.
      child = spawn(cmd, args, { cwd, env: env ?? process.env, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    } catch (err) {
      resolve({ status: null, stdout: '', stderr: '', timedOut: false, error: err });
      return;
    }

    liveGroups.add(child);
    const pending = { stdout: '', stderr: '' };
    const onData = (stream) => (chunk) => {
      const text = chunk.toString('utf8');
      out[stream] += text;
      if (!echo) return;
      const lines = (pending[stream] + text).split('\n');
      pending[stream] = lines.pop();
      for (const line of lines) write(`[${step}] ${line}\n`);
    };
    child.stdout.on('data', onData('stdout'));
    child.stderr.on('data', onData('stderr'));

    let killTimer;
    const stop = () => {
      if (killTimer) return;
      killGroup(child, 'SIGTERM');
      killTimer = setTimeout(() => {
        killGroup(child, 'SIGKILL');
        liveGroups.delete(child);
      }, KILL_GRACE_MS);
    };
    const timer =
      Number.isFinite(timeoutMs) &&
      setTimeout(() => {
        timedOut = true;
        stop();
      }, Math.max(0, timeoutMs));
    const onAbort = () => {
      interrupted = true;
      stop();
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    child.on('error', (err) => {
      error = err;
    });
    child.on('close', (status) => {
      clearTimeout(timer);
      // A stopped command's group gets its SIGKILL even after the command
      // itself exited, without keeping this process alive for it.
      if (killTimer) killTimer.unref();
      else liveGroups.delete(child);
      signal?.removeEventListener('abort', onAbort);
      if (echo) {
        for (const stream of ['stdout', 'stderr']) if (pending[stream]) write(`[${step}] ${pending[stream]}\n`);
      }
      resolve({ status: timedOut || interrupted || error ? null : status, ...out, timedOut, interrupted, error });
    });
  });
}

/**
 * Sends `sig` (default SIGKILL) to the process group of every command
 * runCommand started that may still be running, including stopped commands
 * whose grandchildren have not exited yet. For an exit that cannot wait.
 */
export function stopAllCommands(sig = 'SIGKILL') {
  for (const child of liveGroups) killGroup(child, sig);
  if (sig === 'SIGKILL') liveGroups.clear();
}

// Sends `sig` to the process group led by `child`, or to `child` alone when
// the group is already gone.
function killGroup(child, sig) {
  try {
    process.kill(-child.pid, sig);
  } catch {
    try {
      child.kill(sig);
    } catch {
      // already exited
    }
  }
}

/**
 * Runs a command through `exec` (signature of runCommand) and throws unless it
 * exits 0: Interrupted when `signal` aborts (before, during or right after the
 * run), TimedOut when `timeoutMs` is spent (before or during the run), an
 * Error naming the command otherwise; for a non-zero exit that Error carries
 * the command's result as `result`. Resolves to the command's result.
 */
export async function runOrThrow(exec, cmd, args, opts = {}) {
  if (opts.signal?.aborted) throw new Interrupted();
  if (opts.timeoutMs !== undefined && opts.timeoutMs <= 0) throw new TimedOut();
  const r = await exec(cmd, args, opts);
  if (r.interrupted || opts.signal?.aborted) throw new Interrupted();
  if (r.timedOut) throw new TimedOut();
  const name = `${cmd} ${args[0] ?? ''}`.trim();
  if (r.error?.code === 'ENOENT') throw new Error(`${name}: the ${cmd} command was not found on PATH`);
  if (r.error) throw new Error(`${name} could not run: ${r.error.message}`);
  if (r.status !== 0) {
    // Output that was not streamed is the only trace of why the command stopped.
    const tail = opts.echo === false ? (r.stderr ?? '').trim().slice(-300) : '';
    throw Object.assign(new Error(`${name} exited with code ${r.status}${tail ? `: ${tail}` : ''}`), { result: r });
  }
  return r;
}

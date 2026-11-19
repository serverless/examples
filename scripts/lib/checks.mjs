// Runs one check from an example manifest against a deployed example.
//
//   http    GET outputs[output] + path, retried every 5 s for up to 90 s until
//           the status and body match
//   invoke  serverless invoke -f <function>; stdout plus stderr must contain
//           `contains`
//   script  node <path> in the example copy; exit code 0 passes

import { Interrupted, runOrThrow, TimedOut } from './exec.mjs';

export const HTTP_RETRY_MS = 5_000;
export const HTTP_WINDOW_MS = 90_000;
// A single HTTP attempt gives up after this long.
const HTTP_ATTEMPT_MS = 10_000;
const EXCERPT_CHARS = 300;

/**
 * Runs `check` (one manifest check) and resolves when it passes; throws an
 * Error describing the mismatch otherwise, TimedOut when `ctx.deadline`
 * passes first, or Interrupted when `ctx.signal` aborts.
 *
 * ctx: {
 *   cwd        the example copy
 *   stage, region?
 *   outputs    { OutputKey: OutputValue } of the deployed stack
 *   exec       runCommand-compatible function
 *   fetchImpl  fetch-compatible function
 *   now        () => epoch ms
 *   sleep      (ms) => Promise
 *   deadline?  epoch ms after which the check stops
 *   signal?    AbortSignal that stops the check
 * }
 */
export async function runCheck(check, ctx) {
  if (ctx.signal?.aborted) throw new Interrupted();
  if (check.http) return httpCheck(check.http, ctx);
  if (check.invoke) return invokeCheck(check.invoke, ctx);
  if (check.script) return scriptCheck(check.script, ctx);
  throw new Error(`unknown check ${JSON.stringify(check)}`);
}

async function httpCheck({ output, path = '', status, contains }, ctx) {
  const { fetchImpl, now, sleep } = ctx;
  const deadline = ctx.deadline ?? Infinity;
  const base = ctx.outputs?.[output];
  if (typeof base !== 'string' || base === '') {
    const known = Object.keys(ctx.outputs ?? {});
    throw new Error(`stack output ${output} not found; the stack has ${known.length ? known.join(', ') : 'no outputs'}`);
  }
  // Joins without doubling the slash between an output ending in / and a path starting with /.
  const url = path.startsWith('/') ? base.replace(/\/+$/, '') + path : base + path;
  const want = [status !== undefined && `status ${status}`, contains !== undefined && `a body containing ${JSON.stringify(contains)}`]
    .filter(Boolean)
    .join(' and ');

  const start = now();
  let attempts = 0;
  let last;
  const stopIfInterrupted = () => {
    if (ctx.signal?.aborted) throw new Interrupted();
  };
  for (;;) {
    stopIfInterrupted();
    if (now() >= deadline) throw new TimedOut();
    attempts += 1;
    last = await httpAttempt(fetchImpl, url, Math.min(HTTP_ATTEMPT_MS, deadline - now()), ctx.signal);
    stopIfInterrupted();
    const statusOk = status === undefined || last.status === status;
    const bodyOk = contains === undefined || (last.body ?? '').includes(contains);
    if (last.status !== undefined && statusOk && bodyOk) return;
    const elapsed = now() - start;
    if (elapsed >= HTTP_WINDOW_MS) break;
    await sleep(Math.min(HTTP_RETRY_MS, HTTP_WINDOW_MS - elapsed));
  }
  const got =
    last.status === undefined
      ? `request error: ${last.error}`
      : `status ${last.status}, body ${JSON.stringify((last.body ?? '').slice(0, EXCERPT_CHARS))}`;
  throw new Error(`GET ${url}: expected ${want}; after ${attempts} attempt(s) in ${HTTP_WINDOW_MS / 1000} s the last response was ${got}`);
}

async function httpAttempt(fetchImpl, url, timeoutMs, stop) {
  const timeout = AbortSignal.timeout(Math.max(1, timeoutMs));
  try {
    const res = await fetchImpl(url, { signal: stop ? AbortSignal.any([timeout, stop]) : timeout });
    let body = '';
    try {
      body = await res.text();
    } catch {
      // A status without a readable body is still a response.
    }
    return { status: res.status, body };
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
}

async function invokeCheck({ function: fn, event, args = [], contains }, ctx) {
  const cliArgs = ['invoke', '-f', fn, '--stage', ctx.stage];
  if (ctx.region) cliArgs.push('--region', ctx.region);
  if (event) cliArgs.push('--path', event);
  cliArgs.push(...args);
  const r = await runOrThrow(ctx.exec, 'serverless', cliArgs, {
    cwd: ctx.cwd,
    step: 'check',
    timeoutMs: remaining(ctx),
    signal: ctx.signal,
  });
  const output = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  if (!output.includes(contains)) {
    throw new Error(
      `serverless invoke -f ${fn}: output does not contain ${JSON.stringify(contains)}; it ends with ${JSON.stringify(output.slice(-EXCERPT_CHARS))}`,
    );
  }
}

async function scriptCheck({ path: script }, ctx) {
  const env = {
    ...process.env,
    EXAMPLE_OUTPUTS: JSON.stringify(ctx.outputs ?? {}),
    EXAMPLE_STAGE: ctx.stage,
    EXAMPLE_DIR: ctx.cwd,
  };
  if (ctx.region) env.EXAMPLE_REGION = ctx.region;
  await runOrThrow(ctx.exec, 'node', [script], { cwd: ctx.cwd, env, step: 'check', timeoutMs: remaining(ctx), signal: ctx.signal });
}

function remaining(ctx) {
  return ctx.deadline === undefined ? undefined : ctx.deadline - ctx.now();
}

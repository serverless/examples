// Creates a user through the deployed API, reads it back and checks that the
// name round-trips. Run by the example test runner, which passes the stack
// outputs in EXAMPLE_OUTPUTS and the stage in EXAMPLE_STAGE.

const OUTPUT = 'HttpApiUrl';
const RETRY_WINDOW_MS = 60_000;
const RETRY_DELAY_MS = 3_000;

const outputs = JSON.parse(process.env.EXAMPLE_OUTPUTS ?? '{}');
const base = outputs[OUTPUT];
if (!base) fail(`stack output ${OUTPUT} not found`);
const url = (path) => base.replace(/\/+$/, '') + path;

const userId = `smoke-${process.env.EXAMPLE_STAGE ?? 'local'}-${Date.now()}`;
const name = `Smoke test ${Math.random().toString(36).slice(2, 8)}`;

const created = await requestUntil(
  () => fetch(url('/users'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId, name }) }),
  `POST ${url('/users')}`,
);
expectUser(created, `POST ${url('/users')}`);

const read = await requestUntil(() => fetch(url(`/users/${encodeURIComponent(userId)}`)), `GET ${url(`/users/${userId}`)}`);
expectUser(read, `GET ${url(`/users/${userId}`)}`);

console.log(`created and read back user ${userId}`);

function expectUser(body, what) {
  if (body?.userId !== userId || body?.name !== name) {
    fail(`${what}: expected ${JSON.stringify({ userId, name })}, got ${JSON.stringify(body)}`);
  }
}

// Repeats the request until it answers 200 with a JSON body, for up to
// RETRY_WINDOW_MS: a new API and a just-written item can take a moment.
async function requestUntil(send, what) {
  const start = Date.now();
  let last;
  for (;;) {
    try {
      const res = await send();
      const text = await res.text();
      if (res.status === 200) return JSON.parse(text);
      last = `status ${res.status}, body ${text.slice(0, 300)}`;
    } catch (err) {
      last = `request error: ${err.message}`;
    }
    if (Date.now() - start >= RETRY_WINDOW_MS) fail(`${what}: expected status 200; last response: ${last}`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
}

function fail(message) {
  console.error(`smoke test failed: ${message}`);
  process.exit(1);
}

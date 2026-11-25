// Does what the README's Try it does: creates a post through the GraphQL API
// with the API key, reads it back by its ID, and checks that a request without
// the key is refused.
//
// Run by the example test runner, with the stack outputs in EXAMPLE_OUTPUTS.
// It calls only the API itself; the post goes with the table when the stack is
// removed.

import { randomBytes } from 'node:crypto';

const RETRY_WINDOW_MS = 90_000;
const RETRY_DELAY_MS = 5_000;

const outputs = JSON.parse(process.env.EXAMPLE_OUTPUTS ?? '{}');
for (const key of ['GraphQlApiUrl', 'GraphQlApiKey']) {
  if (!outputs[key]) fail(`stack output ${key} not found; got ${Object.keys(outputs).join(', ')}`);
}
const url = outputs.GraphQlApiUrl;
const apiKey = outputs.GraphQlApiKey;

const title = `Hello from the smoke test ${randomBytes(4).toString('hex')}`;

// A new API can take a moment to accept its key, so the first request retries.
const created = await until(
  'createPost',
  () => graphql('mutation ($title: String!) { createPost(title: $title) { id title } }', { title }),
  (r) => r.status === 200 && r.body?.data?.createPost,
);
const post = created.body.data.createPost;
if (post.title !== title || !post.id) fail(`createPost: expected a post with title "${title}" and an ID; got ${JSON.stringify(post)}`);

const read = await graphql('query ($id: ID!) { getPost(id: $id) { id title } }', { id: post.id });
const got = read.body?.data?.getPost;
if (read.status !== 200 || got?.id !== post.id || got?.title !== title) {
  fail(`getPost(${post.id}): expected {"id":"${post.id}","title":"${title}"}; got status ${read.status}, ${read.text.slice(0, 300)}`);
}

const missing = await graphql('query ($id: ID!) { getPost(id: $id) { id title } }', { id: 'no-such-post' });
if (missing.status !== 200 || missing.body?.data?.getPost !== null) {
  fail(`getPost(no-such-post): expected data.getPost null; got status ${missing.status}, ${missing.text.slice(0, 300)}`);
}

const noKey = await graphql('query ($id: ID!) { getPost(id: $id) { id } }', { id: post.id }, { withKey: false });
if (noKey.status !== 401) fail(`request without x-api-key: expected status 401; got ${noKey.status}, ${noKey.text.slice(0, 300)}`);

console.log(`${url}: createPost returned ${post.id}; getPost read back "${title}"; unknown ID null; no API key 401`);

async function graphql(query, variables, { withKey = true } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (withKey) headers['x-api-key'] = apiKey;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = undefined;
  }
  return { status: res.status, text, body };
}

// Repeats `request` every RETRY_DELAY_MS until `done` accepts the response, for
// up to RETRY_WINDOW_MS.
async function until(what, request, done) {
  const start = Date.now();
  let last;
  for (;;) {
    try {
      const r = await request();
      if (done(r)) return r;
      last = `status ${r.status}, body ${r.text.slice(0, 200)}`;
    } catch (err) {
      last = `request error: ${err.message}`;
    }
    if (Date.now() - start >= RETRY_WINDOW_MS) fail(`${what}: no expected answer within ${RETRY_WINDOW_MS / 1000} s; last: ${last}`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
}

function fail(message) {
  console.error(`smoke test failed: ${message}`);
  process.exit(1);
}

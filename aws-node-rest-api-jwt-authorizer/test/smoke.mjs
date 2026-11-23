// Does what the README's Try it does: calls the public endpoint, creates a user
// in the stack's user pool, gets its tokens, and checks which requests the JWT
// authorizer lets through to the functions and what the functions return.
//
// Run by the example test runner, with the stack outputs in EXAMPLE_OUTPUTS,
// EXAMPLE_REGION set and AWS credentials in the environment. It calls Amazon
// Cognito with the aws CLI: admin-create-user, admin-set-user-password and
// admin-initiate-auth. The user goes with the pool when the stack is removed.

import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const RETRY_WINDOW_MS = 90_000;
const RETRY_DELAY_MS = 5_000;
const ADMIN_SCOPE = 'aws.cognito.signin.user.admin';

const outputs = JSON.parse(process.env.EXAMPLE_OUTPUTS ?? '{}');
for (const key of ['ServiceEndpoint', 'UserPoolId', 'UserPoolClientId']) {
  if (!outputs[key]) fail(`stack output ${key} not found; got ${Object.keys(outputs).join(', ')}`);
}
const api = outputs.ServiceEndpoint.replace(/\/+$/, '');
const poolId = outputs.UserPoolId;
// A user pool ID starts with its Region: eu-west-1_AbCdEf123.
const region = process.env.EXAMPLE_REGION ?? poolId.split('_')[0];

// A new stage can take a moment to serve every path, so the first request retries.
const hello = await until('GET /hello', () => get('/hello'), (r) => r.status === 200);
expectBody('GET /hello', hello, (b) => b.message === 'Hello from a public endpoint. No token needed.');

const noToken = await until('GET /me without a token', () => get('/me'), (r) => r.status === 401);
expectNotReached('GET /me without a token', noToken);

const { idToken, accessToken } = tokensOfNewUser();
const sub = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8')).sub;

const me = await until('GET /me with the ID token', () => get('/me', idToken), (r) => r.status === 200);
const meCaller = expectBody('GET /me with the ID token', me, (b) => b.message === 'Hello from an endpoint that takes an ID token.' && b.caller?.sub === sub && b.caller?.tokenUse === 'id').caller;

const accountWithId = await get('/account', idToken);
expectStatus('GET /account with the ID token', accountWithId, 401);
expectNotReached('GET /account with the ID token', accountWithId);

const account = await get('/account', accessToken);
expectStatus('GET /account with the access token', account, 200);
expectBody(
  'GET /account with the access token',
  account,
  (b) =>
    b.message === 'Hello from an endpoint that takes an access token with a scope.' &&
    b.caller?.sub === sub &&
    b.caller?.tokenUse === 'access' &&
    String(b.caller?.scope).split(' ').includes(ADMIN_SCOPE),
);

console.log(
  `${api}: /hello 200; /me 401 without a token, 200 with the ID token; /account 401 with the ID token, 200 with the access token; caller ${sub}; claims from ${meCaller.claimsFrom}`,
);

// Creates a user with a random password and returns its ID and access tokens.
function tokensOfNewUser() {
  const username = `smoke-${randomBytes(4).toString('hex')}`;
  const password = `Aa1-${randomBytes(16).toString('hex')}`;
  const pool = ['--region', region, '--user-pool-id', poolId];
  aws(['cognito-idp', 'admin-create-user', ...pool, '--username', username, '--message-action', 'SUPPRESS']);
  aws(['cognito-idp', 'admin-set-user-password', ...pool, '--username', username, '--password', password, '--permanent']);
  const out = aws([
    'cognito-idp',
    'admin-initiate-auth',
    ...pool,
    '--client-id',
    outputs.UserPoolClientId,
    '--auth-flow',
    'ADMIN_USER_PASSWORD_AUTH',
    '--auth-parameters',
    `USERNAME=${username},PASSWORD=${password}`,
    '--query',
    'AuthenticationResult.[IdToken,AccessToken]',
    '--output',
    'text',
  ]);
  const [idToken, accessToken] = out.trim().split(/\s+/);
  if (!idToken?.includes('.') || !accessToken?.includes('.')) fail('admin-initiate-auth: expected an ID token and an access token');
  return { idToken, accessToken };
}

async function get(path, token) {
  const res = await fetch(`${api}${path}`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
  return { status: res.status, errorType: res.headers.get('x-amzn-errortype'), text: await res.text() };
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

function expectStatus(what, r, status) {
  if (r.status !== status) fail(`${what}: expected status ${status}; got ${r.status}, body ${r.text.slice(0, 300)}`);
}

// API Gateway answered the request itself, without calling a function: every
// function's body starts its message with "Hello from".
function expectNotReached(what, r) {
  if (r.errorType !== 'UnauthorizedException' || r.text.includes('Hello from')) {
    fail(`${what}: expected API Gateway's UnauthorizedException; got x-amzn-errortype ${r.errorType}, body ${r.text.slice(0, 300)}`);
  }
}

function expectBody(what, r, ok) {
  let body;
  try {
    body = JSON.parse(r.text);
  } catch {
    fail(`${what}: expected JSON; got ${r.text.slice(0, 300)}`);
  }
  if (!ok(body)) fail(`${what}: unexpected body ${r.text.slice(0, 500)}`);
  return body;
}

function aws(args) {
  try {
    return execFileSync('aws', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    // The arguments and err.message can hold the password: report only the command and its stderr.
    return fail(`aws ${args.slice(0, 2).join(' ')}: exit ${err.status}, ${String(err.stderr ?? '').trim().slice(0, 300)}`);
  }
}

function fail(message) {
  console.error(`smoke test failed: ${message}`);
  process.exit(1);
}

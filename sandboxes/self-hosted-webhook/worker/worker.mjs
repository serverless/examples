// In-MicroVM worker for the Claude self-hosted sandbox.
//
// This worker is built into the MicroVM image by the Serverless Framework
// `sandboxes` feature (see ../serverless.yml). It serves the MicroVM lifecycle
// hooks on port 9000:
//   POST /aws/lambda-microvms/runtime/v1/ready     (image build: snapshot gate)
//   POST /aws/lambda-microvms/runtime/v1/validate  (post-build smoke test)
//   POST /aws/lambda-microvms/runtime/v1/run       (once, after run from snapshot)
//   POST /aws/lambda-microvms/runtime/v1/resume    (after SUSPENDED -> RUNNING)
//   POST /aws/lambda-microvms/runtime/v1/suspend   (before RUNNING -> SUSPENDED)
//   POST /aws/lambda-microvms/runtime/v1/terminate (before termination)
//
// The /run hook receives the per-session dispatch payload (session id,
// environment id, secret reference, region) that the launcher Lambda passed to
// RunMicrovm as `runHookPayload`. The worker acknowledges immediately (200),
// then:
//   1. Fetches the environment key from Secrets Manager (using the MicroVM's
//      own execution role — the org API key never reaches this VM).
//   2. Polls the Anthropic work queue for the matching session.
//   3. Handles the session's tool calls in /workspace.
//   4. Exits — the MicroVM terminates when the worker process exits (the container stops).
//
// NOTE: without a real Claude Managed Agent session (the "just a webhook" test),
// the /run hook still fires and this worker boots and polls, but finds no work
// to claim and exits cleanly. That is expected — the test exercises the webhook
// -> launcher -> RunMicrovm path, not the agent loop.

import http from 'node:http'
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'
import Anthropic from '@anthropic-ai/sdk'
import {
  WorkPoller,
  EnvironmentWorker,
} from '@anthropic-ai/sdk/helpers/beta/environments'

const HOOK_PORT = Number(process.env.HOOK_PORT || 9000)
const HOOK_HOST = '0.0.0.0'
const HOOK_PREFIX = '/aws/lambda-microvms/runtime/v1'

let sessionStarted = false // guard: handle the session at most once per VM

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf-8')
}

async function fetchEnvironmentKey(secretId, region) {
  const client = new SecretsManagerClient({ region })
  const result = await client.send(
    new GetSecretValueCommand({ SecretId: secretId }),
  )
  if (!result.SecretString) {
    throw new Error(`secret ${secretId} has no SecretString`)
  }
  return result.SecretString
}

// Handle exactly the session named in the dispatch.
async function handleSession(dispatch) {
  const sessionId = dispatch.ANTHROPIC_SESSION_ID
  const environmentId = dispatch.ANTHROPIC_ENVIRONMENT_ID
  const secretId = dispatch.ENVIRONMENT_KEY_SECRET_ID
  const region = dispatch.AWS_REGION
  const baseURL = dispatch.ANTHROPIC_BASE_URL || undefined

  const environmentKey = await fetchEnvironmentKey(secretId, region)
  const client = new Anthropic({ authToken: environmentKey, baseURL })
  const worker = new EnvironmentWorker({
    client,
    environmentId,
    environmentKey,
    workdir: '/workspace',
  })

  console.log(`worker: looking for work item for session ${sessionId}`)
  const poller = new WorkPoller({
    client,
    environmentId,
    environmentKey,
    reclaimOlderThanMs: 2000,
    drain: true,
    autoStop: false,
  })

  for await (const work of poller) {
    if (work.data.type !== 'session' || work.data.id !== sessionId) {
      continue
    }
    console.log(`worker: handling session ${sessionId} (work ${work.id})`)
    await worker.handleItem({
      workId: work.id,
      environmentId,
      sessionId,
      environmentKey,
    })
    console.log(`worker: session ${sessionId} complete`)
    return
  }
  console.warn(`worker: no work item found for session ${sessionId}`)
}

// Turn a session failure into a calm, actionable message instead of a raw stack trace — so running
// the example before a real Claude environment is wired up doesn't look like a crash. Returns true
// for expected/handled cases (clean stop), false for genuinely unexpected errors.
function explainSessionFailure(err, dispatch) {
  const kind = err?.name || err?.__type || ''
  const msg = err?.message || ''
  const secretId = dispatch?.ENVIRONMENT_KEY_SECRET_ID || '<EnvironmentKeySecret>'

  // No environment key stored yet: the secret exists but has no value (GetSecretValue returns
  // ResourceNotFoundException for the AWSCURRENT label), or it has an empty SecretString.
  if (
    kind === 'ResourceNotFoundException' ||
    /has no SecretString|specified secret value/i.test(msg)
  ) {
    console.log(
      'worker: no Anthropic environment key is stored yet — stopping here (this is expected).\n' +
        '  The webhook was verified, a MicroVM was launched, and this worker received the session\n' +
        '  dispatch — so the full launch path works. There is just no environment key to\n' +
        '  authenticate to Anthropic with, so there is no real session to run.\n' +
        '  To run real sessions, store your Anthropic environment key and re-trigger:\n' +
        `    aws secretsmanager put-secret-value --secret-id ${secretId} --secret-string <env key>`,
    )
    return true
  }

  // The MicroVM has no usable AWS credentials to read the secret.
  if (kind === 'CredentialsProviderError' || /load credentials/i.test(msg)) {
    console.log(
      'worker: the MicroVM has no AWS credentials, so it cannot read the environment key.\n' +
        '  Locally, run `serverless dev --sandbox worker` (it assumes the execution role; or it uses\n' +
        '  your local credentials with --no-assume-role). In production the MicroVM uses its\n' +
        '  execution role automatically.',
    )
    return true
  }
  if (kind === 'ExpiredTokenException' || /security token.*expired/i.test(msg)) {
    console.log(
      'worker: the AWS credentials provided to the MicroVM are expired.\n' +
        '  Locally, restart `serverless dev --sandbox worker` to refresh them.',
    )
    return true
  }

  // Genuinely unexpected — surface the full error for debugging.
  console.error('worker: session failed', err)
  return false
}

function ackThenRun(res, dispatch) {
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ status: 'accepted' }))
  if (sessionStarted) return
  sessionStarted = true
  handleSession(dispatch).then(
    () => process.exit(0), // clean exit; the MicroVM terminates when the container stops
    (err) => {
      // Expected cases (no env key yet, dev cred issues) exit cleanly; unexpected → non-zero.
      const expected = explainSessionFailure(err, dispatch)
      process.exit(expected ? 0 : 1)
    },
  )
}

const server = http.createServer(async (req, res) => {
  const ok = (body = { status: 'ok' }) => {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify(body))
  }

  if (req.method !== 'POST' || !req.url.startsWith(HOOK_PREFIX)) {
    res.writeHead(404)
    res.end()
    return
  }
  const hook = req.url.slice(HOOK_PREFIX.length + 1) // path part after the prefix
  console.log(`worker: ${hook} hook received`)

  switch (hook) {
    case 'ready': // image build: app initialized, safe to snapshot
    case 'validate': // post-build smoke test of the snapshot
    case 'resume':
    case 'suspend':
    case 'terminate':
      ok()
      return
    case 'run': {
      try {
        const raw = await readBody(req)
        const envelope = raw ? JSON.parse(raw) : {}
        // The service wraps the payload: { microvmId, runHookPayload: "<JSON>" }.
        const inner = envelope.runHookPayload
          ? JSON.parse(envelope.runHookPayload)
          : envelope
        const dispatch = inner.session || inner
        if (!dispatch.ANTHROPIC_SESSION_ID) {
          console.error(
            'worker: /run hook missing ANTHROPIC_SESSION_ID in payload:',
            raw,
          )
          res.writeHead(400, { 'content-type': 'application/json' })
          res.end(JSON.stringify({ error: 'missing ANTHROPIC_SESSION_ID' }))
          return
        }
        ackThenRun(res, dispatch)
      } catch (err) {
        console.error('worker: /run hook error', err)
        res.writeHead(400, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: 'invalid run payload' }))
      }
      return
    }
    default:
      res.writeHead(404)
      res.end()
  }
})

server.listen(HOOK_PORT, HOOK_HOST, () => {
  console.log(`worker: hook server listening on ${HOOK_HOST}:${HOOK_PORT}`)
})

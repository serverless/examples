// Launcher Lambda: launch one ephemeral MicroVM per started Claude session.
//
// On a `session.status_run_started` webhook from Anthropic, this function:
//   1. Verifies + parses the webhook with the Anthropic SDK's `webhooks.unwrap()`
//      — it checks the Standard Webhooks signature AND returns the typed event,
//      so we read `event.data.type` / `event.data.id` instead of hand-parsing the
//      `{ type: "event", data: { type, id } }` envelope (which is easy to get wrong).
//   2. Calls RunMicrovm to launch one isolated MicroVM, delivering the per-
//      session dispatch through `runHookPayload`.
//
// Security model: the launcher passes only a *reference* to the environment-key
// secret into the MicroVM (ENVIRONMENT_KEY_SECRET_ID). The MicroVM's own
// execution role reads the key at runtime. The organization API key never
// reaches AWS compute.

import Anthropic from '@anthropic-ai/sdk'
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'
import {
  LambdaMicrovmsClient,
  RunMicrovmCommand,
} from '@aws-sdk/client-lambda-microvms'

// `unwrap()` only verifies the webhook signature — it makes no API calls — so no
// real API key is needed here (the org key never reaches the launcher by design).
const anthropic = new Anthropic({ apiKey: 'webhook-verification-only' })

const REGION = process.env.AWS_REGION || 'us-east-1'
const SESSION_RUN_STARTED = 'session.status_run_started'
const RUN_HOOK_PAYLOAD_VERSION = '1'

// Per-session MicroVM idle policy. Two sequential gates: after
// `maxIdleDurationSeconds` of no activity the VM is SUSPENDED, then after
// `suspendedDurationSeconds` parked it is TERMINATED (autoResume off, so traffic
// won't wake it). These match the official AWS sample's defaults.
const IDLE_POLICY = {
  maxIdleDurationSeconds: 300,
  suspendedDurationSeconds: 60,
  autoResumeEnabled: false,
}
// Ceiling for a stuck session. The service max is 28800s (8h); this example
// uses a short ceiling so a forgotten demo MicroVM auto-terminates.
const MAX_LIFETIME_SECONDS = Number(process.env.MAX_LIFETIME_SECONDS || 600)

// Network connectors attached to each MicroVM:
//  - HTTP_INGRESS: the platform reaches the VM over HTTP to deliver lifecycle
//    hooks and to proxy data-plane requests, so an HTTP ingress connector is
//    required (RunMicrovm attaches one by default; we pass it explicitly).
//    HTTP-only is tighter than ALL_INGRESS.
//  - INTERNET_EGRESS: the worker calls out to api.anthropic.com and Secrets Manager.
const httpIngressArn = `arn:aws:lambda:${REGION}:aws:network-connector:aws-network-connector:HTTP_INGRESS`
const internetEgressArn = `arn:aws:lambda:${REGION}:aws:network-connector:aws-network-connector:INTERNET_EGRESS`

const secrets = new SecretsManagerClient({ region: REGION })
const microvms = new LambdaMicrovmsClient({
  region: REGION,
  // Local dev only: point RunMicrovm at the local emulator started by
  // `serverless dev --sandbox worker`. A launcher-specific var on purpose — NOT the standard
  // AWS_ENDPOINT_URL_LAMBDA_MICROVMS, which the AWS SDK honors for *every* MicroVMs client in the
  // process (including the framework's own deploy-time calls that must reach real AWS). Unset in
  // production, so this is a no-op there.
  ...(process.env.MICROVM_DEV_ENDPOINT && {
    endpoint: process.env.MICROVM_DEV_ENDPOINT,
  }),
})

let cachedSecret
let cachedSecretAt = 0
const SECRET_TTL_MS = 300_000

async function getSigningSecret() {
  const now = Date.now()
  if (cachedSecret && now - cachedSecretAt < SECRET_TTL_MS) return cachedSecret
  const r = await secrets.send(
    new GetSecretValueCommand({ SecretId: process.env.SIGNING_SECRET_ARN }),
  )
  cachedSecret = r.SecretString
  cachedSecretAt = now
  return cachedSecret
}

function lowerHeaders(headers = {}) {
  const out = {}
  for (const [k, v] of Object.entries(headers)) out[k.toLowerCase()] = v
  return out
}

// Non-secret per-session dispatch delivered to the MicroVM via the /run hook.
// Carries only a *reference* to the environment-key secret, never the key.
function buildRunHookPayload(sessionId) {
  const session = {
    ANTHROPIC_SESSION_ID: sessionId,
    ANTHROPIC_ENVIRONMENT_ID: process.env.ANTHROPIC_ENVIRONMENT_ID,
    ENVIRONMENT_KEY_SECRET_ID: process.env.ENVIRONMENT_KEY_SECRET_ID,
    AWS_REGION: REGION,
  }
  if (process.env.ANTHROPIC_BASE_URL) {
    session.ANTHROPIC_BASE_URL = process.env.ANTHROPIC_BASE_URL
  }
  return JSON.stringify({ version: RUN_HOOK_PAYLOAD_VERSION, session })
}

function resp(statusCode, body) {
  return {
    statusCode,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }
}

export const handler = async (event) => {
  const rawBody =
    typeof event.body === 'string'
      ? event.body
      : JSON.stringify(event.body || {})
  const headers = lowerHeaders(event.headers)

  // 1. Verify + parse the webhook. Anyone can POST here, so this signature check
  // is the only thing that proves the request genuinely came from Anthropic.
  // `unwrap()` verifies the Standard Webhooks signature (throwing on a bad or
  // stale signature) and returns the typed event.
  let webhookEvent
  try {
    webhookEvent = anthropic.beta.webhooks.unwrap(rawBody, {
      headers,
      key: await getSigningSecret(),
    })
  } catch (err) {
    console.warn('webhook signature verification failed:', err.message)
    return resp(401, 'signature verification failed')
  }

  // 2. Only act on session.status_run_started. Acknowledge everything else 200
  // so Anthropic does not retry. The specific event type + session id live under
  // `data` (the top-level `type` is always "event").
  if (webhookEvent?.data?.type !== SESSION_RUN_STARTED) {
    console.log(`ignoring event data.type=${webhookEvent?.data?.type}`)
    return resp(200, 'ignored')
  }
  const sessionId = webhookEvent?.data?.id
  if (!sessionId) {
    console.warn('ignoring event: missing data.id (session id)')
    return resp(200, 'ignored')
  }

  // Fail fast on a missing environment id. Without it the MicroVM worker would
  // poll an empty environment and fail with a 404 that looks unrelated — surface
  // the real cause here instead. Set provider.environment.ANTHROPIC_ENVIRONMENT_ID
  // (e.g. `export ANTHROPIC_ENVIRONMENT_ID=env_... && serverless deploy`).
  if (!process.env.ANTHROPIC_ENVIRONMENT_ID) {
    console.error(
      'ANTHROPIC_ENVIRONMENT_ID is not set — refusing to launch. The worker needs it to poll the right environment; set it on the launcher and redeploy.',
    )
    return resp(500, { error: 'missing_environment_id', session_id: sessionId })
  }

  // 3. Launch one MicroVM, delivering the dispatch via runHookPayload.
  try {
    const r = await microvms.send(
      new RunMicrovmCommand({
        imageIdentifier: process.env.MICROVM_IMAGE_IDENTIFIER,
        runHookPayload: buildRunHookPayload(sessionId),
        maximumDurationInSeconds: MAX_LIFETIME_SECONDS,
        executionRoleArn: process.env.MICROVM_EXECUTION_ROLE_ARN,
        idlePolicy: IDLE_POLICY,
        ingressNetworkConnectors: [httpIngressArn],
        egressNetworkConnectors: [internetEgressArn],
      }),
    )
    console.log(`launched microvm_id=${r.microvmId} for session_id=${sessionId}`)
    return resp(200, { microvm_id: r.microvmId, session_id: sessionId })
  } catch (err) {
    console.error(`RunMicrovm failed for session ${sessionId}:`, err)
    // Non-2xx so Anthropic retries the delivery.
    return resp(502, { error: 'run_microvm_failed', session_id: sessionId })
  }
}

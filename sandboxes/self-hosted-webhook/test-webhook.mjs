// Send a synthetic, correctly-signed `session.status_run_started` webhook to the
// deployed launcher — the "just a webhook" test (no Claude Managed Agent needed).
//
// It signs the event with the Standard Webhooks scheme using the SAME signing
// secret stored in the SigningSecret Secrets Manager secret, so the launcher's
// in-process verification passes and it calls RunMicrovm to launch a MicroVM.
//
// Usage:
//   WEBHOOK_URL=<stack WebhookUrl output> \
//   SIGNING_SECRET=<the whsec_... you stored in SigningSecret> \
//   node test-webhook.mjs
//
// Then confirm a MicroVM launched:
//   aws lambda-microvms list-microvms --image-identifier <worker image arn>

import { Webhook } from 'standardwebhooks'

const url = process.env.WEBHOOK_URL || process.argv[2]
const secret = process.env.SIGNING_SECRET || process.argv[3]

if (!url || !secret) {
  console.error(
    'Usage: WEBHOOK_URL=<url> SIGNING_SECRET=<whsec_...> node test-webhook.mjs',
  )
  process.exit(2)
}

// A minimal session.status_run_started webhook (the real envelope shape: a
// top-level `type: "event"` wrapper, with the specific event type + session id
// under `data`). The launcher switches on `data.type` and reads `data.id`.
const nowIso = new Date().toISOString()
const sessionId = `sesn_test_${Date.now()}`
const payload = JSON.stringify({
  type: 'event',
  id: `event_test_${Date.now()}`,
  created_at: nowIso,
  data: { type: 'session.status_run_started', id: sessionId },
})

// Sign with the Standard Webhooks scheme (same library the Anthropic SDK uses).
const wh = new Webhook(secret)
const msgId = `msg_test_${Date.now()}`
const timestamp = new Date()
const signature = wh.sign(msgId, timestamp, payload)

const headers = {
  'content-type': 'application/json',
  'webhook-id': msgId,
  'webhook-timestamp': Math.floor(timestamp.getTime() / 1000).toString(),
  'webhook-signature': signature,
}

console.log(`POST ${url}`)
console.log(`  session id: ${sessionId}`)
const res = await fetch(url, { method: 'POST', headers, body: payload })
const text = await res.text()
console.log(`<- ${res.status} ${text}`)

if (res.ok) {
  console.log(
    '\nWebhook accepted. Confirm the MicroVM launched:\n' +
      '  aws lambda-microvms list-microvms --image-identifier <worker image arn> \\\n' +
      "    --query 'items[].[microvmId,state,startedAt]' --output table",
  )
  process.exit(0)
} else {
  console.error('\nWebhook rejected — check the launcher logs.')
  process.exit(1)
}

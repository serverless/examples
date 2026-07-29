#!/usr/bin/env node
/**
 * Shared test client for the aws-mcp-servers examples. Every example serves
 * the same canonical MCP server, so this same script tests all of them.
 *
 * Usage:
 *   ENDPOINT=<url to the /mcp endpoint> node client.mjs
 *   LONG=1 ENDPOINT=... node client.mjs          # adds a ~36s streaming case
 *   AUTH=sigv4 SERVICE=bedrock-agentcore ENDPOINT=<AgentCore runtime URL> node client.mjs
 *   AUTH=sigv4 SERVICE=lambda ENDPOINT=... node client.mjs   # IAM-auth Function URL
 *
 * Exercises the full 2026-07-28 surface: plain JSON, SSE progress streaming,
 * an elicitation round-trip, resources (static + template), prompts,
 * server/discover, cache hints, the legacy fallback, and two negative cases
 * (header mismatch -32020, missing capability -32021).
 */

const ENDPOINT = process.env.ENDPOINT
if (!ENDPOINT) {
  console.error('Set ENDPOINT to the MCP endpoint URL')
  process.exit(1)
}

// --- endpoint + optional SigV4 signing --------------------------------------

let url = new URL(ENDPOINT)
let signer
if (process.env.AUTH === 'sigv4') {
  const service = process.env.SERVICE || 'lambda'
  if (service === 'bedrock-agentcore' && url.pathname.includes('/runtimes/')) {
    // AgentCore runtime URLs embed the agent ARN - the WHOLE ARN must be
    // URL-encoded in the path (including its inner "/").
    const arn = decodeURIComponent(url.pathname.match(/\/runtimes\/(.+?)\/invocations/)[1])
    url = new URL(`${url.origin}/runtimes/${encodeURIComponent(arn)}/invocations`)
    url.searchParams.set('qualifier', 'DEFAULT')
  }
  const [{ SignatureV4 }, { HttpRequest }, { Sha256 }, { defaultProvider }] = await Promise.all([
    import('@smithy/signature-v4'),
    import('@smithy/protocol-http'),
    import('@aws-crypto/sha256-js'),
    import('@aws-sdk/credential-provider-node'),
  ])
  const sigv4 = new SignatureV4({
    service,
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: defaultProvider(),
    sha256: Sha256,
  })
  signer = async (method, headers, body) => {
    const request = new HttpRequest({
      method,
      protocol: url.protocol,
      hostname: url.hostname,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: { host: url.hostname, ...headers },
      ...(body != null && { body }),
    })
    return (await sigv4.sign(request)).headers
  }
}

// --- request helpers ---------------------------------------------------------

const CAPS_ELICIT = { elicitation: { form: {} } }
const meta = (capabilities = {}) => ({
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientInfo': { name: 'aws-mcp-servers-client', version: '1.0.0' },
  'io.modelcontextprotocol/clientCapabilities': capabilities,
})

let id = 0
async function request({ method, params = {}, name, capabilities, headerMethod, envelope = true }) {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: ++id,
    method,
    params: envelope ? { ...params, _meta: { ...meta(capabilities), ...(params._meta ?? {}) } } : params,
  })
  let headers = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
    ...(envelope && {
      'mcp-protocol-version': '2026-07-28',
      'mcp-method': headerMethod ?? method,
      ...(name && { 'mcp-name': name }),
    }),
  }
  if (signer) headers = await signer('POST', headers, body)
  const t0 = Date.now()
  const res = await fetch(url, { method: 'POST', headers, body })
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('text/event-stream')) {
    const events = []
    const decoder = new TextDecoder()
    let buffer = ''
    for await (const chunk of res.body) {
      buffer += decoder.decode(chunk, { stream: true })
      let sep
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, sep)
        buffer = buffer.slice(sep + 2)
        const data = frame.split('\n').find((l) => l.startsWith('data:'))?.slice(5).trim()
        if (data) events.push({ t: Date.now() - t0, data: JSON.parse(data) })
      }
    }
    const final = events.at(-1)?.data
    return { status: res.status, contentType, events, json: final, ms: Date.now() - t0 }
  }
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  return { status: res.status, contentType, events: [], json, ms: Date.now() - t0 }
}

// --- tiny harness ------------------------------------------------------------

const results = []
async function check(label, fn) {
  try {
    const detail = await fn()
    results.push({ label, ok: true })
    console.log(`PASS  ${label}${detail ? ` — ${detail}` : ''}`)
  } catch (err) {
    results.push({ label, ok: false })
    console.log(`FAIL  ${label} — ${err.message}`)
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg)
}
// AgentCore Runtime replaces 4xx response bodies with its own error envelope
// (-32010, "Received error (400) ..."); the 400 status still proves the SDK
// rejected the request, so the negative cases accept that form there.
const rejectedWith = (json, code) =>
  json.error?.code === code ||
  (process.env.SERVICE === 'bedrock-agentcore' &&
    json.error?.code === -32010 &&
    /\(4\d\d\)/.test(json.error?.message ?? ''))

// --- test cases ----------------------------------------------------------------

await check('1. tools/list returns the canonical tools with cache hints', async () => {
  const r = await request({ method: 'tools/list' })
  assert(r.status === 200, `HTTP ${r.status}`)
  assert(r.contentType.includes('application/json'), `content-type ${r.contentType}`)
  const names = (r.json.result?.tools ?? []).map((t) => t.name).sort()
  assert(JSON.stringify(names) === JSON.stringify(['add', 'approve_refund', 'slow_report']), `tools: ${names}`)
  assert(r.json.result.ttlMs === 300000, `ttlMs ${r.json.result.ttlMs}`)
  assert(r.json.result.cacheScope === 'public', `cacheScope ${r.json.result.cacheScope}`)
  return `ttlMs=${r.json.result.ttlMs} cacheScope=${r.json.result.cacheScope}`
})

await check('2. add returns plain JSON with structured content', async () => {
  const r = await request({ method: 'tools/call', params: { name: 'add', arguments: { a: 2, b: 40 } }, name: 'add' })
  assert(r.status === 200, `HTTP ${r.status}`)
  assert(r.contentType.includes('application/json'), `content-type ${r.contentType}`)
  assert(r.json.result?.structuredContent?.sum === 42, JSON.stringify(r.json))
  return 'sum=42'
})

await check('3. slow_report streams incremental progress over SSE', async () => {
  const r = await request({
    method: 'tools/call',
    params: { name: 'slow_report', arguments: { steps: 3, progressToken: 'pt' }, _meta: { progressToken: 'pt' } },
    name: 'slow_report',
  })
  assert(r.status === 200, `HTTP ${r.status}`)
  assert(r.contentType.includes('text/event-stream'), `content-type ${r.contentType}`)
  const progress = r.events.filter((e) => e.data.method === 'notifications/progress')
  assert(progress.length === 3, `${progress.length} progress events`)
  assert(progress[0].t < r.ms - 500, 'first progress event did not arrive before the final result')
  assert(r.json.result?.content?.[0]?.text === 'completed 3 steps', JSON.stringify(r.json))
  return `3 progress events, first at +${progress[0].t}ms, done in ${r.ms}ms`
})

await check('4. approve_refund elicitation round-trip (accept and cancel)', async () => {
  const ask = await request({
    method: 'tools/call',
    params: { name: 'approve_refund', arguments: { orderId: 'o-1' } },
    name: 'approve_refund',
    capabilities: CAPS_ELICIT,
  })
  assert(ask.json.result?.resultType === 'input_required', JSON.stringify(ask.json))
  assert(ask.json.result?.inputRequests?.confirm, 'missing inputRequests.confirm')
  const accepted = await request({
    method: 'tools/call',
    params: {
      name: 'approve_refund',
      arguments: { orderId: 'o-1' },
      inputResponses: { confirm: { action: 'accept', content: { confirmed: true } } },
    },
    name: 'approve_refund',
    capabilities: CAPS_ELICIT,
  })
  assert(accepted.json.result?.content?.[0]?.text === 'refunded o-1', JSON.stringify(accepted.json))
  const cancelled = await request({
    method: 'tools/call',
    params: {
      name: 'approve_refund',
      arguments: { orderId: 'o-1' },
      inputResponses: { confirm: { action: 'accept', content: { confirmed: false } } },
    },
    name: 'approve_refund',
    capabilities: CAPS_ELICIT,
  })
  assert(cancelled.json.result?.content?.[0]?.text === 'refund cancelled', JSON.stringify(cancelled.json))
  return 'input_required -> refunded o-1 / refund cancelled'
})

await check('5. resources list + read (Mcp-Name carries the uri)', async () => {
  const list = await request({ method: 'resources/list' })
  const uris = (list.json.result?.resources ?? []).map((r) => r.uri)
  assert(uris.includes('guide://usage'), `resources: ${uris}`)
  const read = await request({ method: 'resources/read', params: { uri: 'guide://usage' }, name: 'guide://usage' })
  assert(read.json.result?.contents?.[0]?.text?.startsWith('# Usage'), JSON.stringify(read.json))
  return 'guide://usage readable'
})

await check('6. resource template read with per-resource cache hint', async () => {
  const templates = await request({ method: 'resources/templates/list' })
  const uriTemplates = (templates.json.result?.resourceTemplates ?? []).map((t) => t.uriTemplate)
  assert(uriTemplates.includes('orders://{orderId}'), `templates: ${uriTemplates}`)
  const read = await request({ method: 'resources/read', params: { uri: 'orders://o-42' }, name: 'orders://o-42' })
  const record = JSON.parse(read.json.result?.contents?.[0]?.text ?? '{}')
  assert(record.orderId === 'o-42' && record.status === 'shipped', JSON.stringify(read.json))
  assert(read.json.result.ttlMs === 60000, `ttlMs ${read.json.result.ttlMs}`)
  return `orders://o-42 -> ${record.status}, ttlMs=${read.json.result.ttlMs}`
})

await check('7. prompts list + get', async () => {
  const list = await request({ method: 'prompts/list' })
  const names = (list.json.result?.prompts ?? []).map((p) => p.name)
  assert(names.includes('summarize_order'), `prompts: ${names}`)
  const got = await request({
    method: 'prompts/get',
    params: { name: 'summarize_order', arguments: { orderId: 'o-7' } },
    name: 'summarize_order',
  })
  const text = got.json.result?.messages?.[0]?.content?.text ?? ''
  assert(text.includes('o-7'), JSON.stringify(got.json))
  return 'summarize_order fills its argument'
})

await check('8. server/discover surfaces the instructions', async () => {
  const r = await request({ method: 'server/discover' })
  assert((r.json.result?.instructions ?? '').includes('Demo MCP server'), JSON.stringify(r.json.result ?? r.json))
  return 'instructions present'
})

await check('9. legacy initialize is answered on the same endpoint', async () => {
  const r = await request({
    method: 'initialize',
    params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'legacy', version: '1.0.0' } },
    envelope: false,
  })
  assert(r.status === 200, `HTTP ${r.status}`)
  const version = r.json.result?.protocolVersion ?? ''
  assert(version.startsWith('2025-'), JSON.stringify(r.json))
  return `served as ${version}`
})

await check('10. GET is answered with the spec-mandated 405', async () => {
  let headers = { accept: 'application/json, text/event-stream' }
  if (signer) headers = await signer('GET', headers, null)
  const res = await fetch(url, { method: 'GET', headers })
  assert(res.status === 405, `HTTP ${res.status}`)
  return 'HTTP 405'
})

await check('11. Mcp-Method header mismatching the body is rejected (-32020)', async () => {
  const r = await request({
    method: 'tools/call',
    params: { name: 'add', arguments: { a: 1, b: 1 } },
    name: 'add',
    headerMethod: 'tools/list',
  })
  assert(rejectedWith(r.json, -32020), JSON.stringify(r.json))
  return r.json.error.code === -32020 ? '-32020' : 'rejected (platform-wrapped 400)'
})

await check('12. elicitation without the client capability is rejected (-32021)', async () => {
  const r = await request({
    method: 'tools/call',
    params: { name: 'approve_refund', arguments: { orderId: 'o-9' } },
    name: 'approve_refund',
    capabilities: {},
  })
  assert(rejectedWith(r.json, -32021), JSON.stringify(r.json))
  return r.json.error.code === -32021 ? '-32021' : 'rejected (platform-wrapped 400)'
})

if (process.env.LONG) {
  await check('13. LONG: 45-step stream (~36s) survives past the 29s mark', async () => {
    const r = await request({
      method: 'tools/call',
      params: { name: 'slow_report', arguments: { steps: 45, progressToken: 'long' }, _meta: { progressToken: 'long' } },
      name: 'slow_report',
    })
    const progress = r.events.filter((e) => e.data.method === 'notifications/progress')
    assert(progress.length === 45, `${progress.length} progress events`)
    assert(r.json.result?.content?.[0]?.text === 'completed 45 steps', 'final result missing (stream cut?)')
    assert(r.ms > 34000, `finished suspiciously fast (${r.ms}ms)`)
    return `45 events over ${(r.ms / 1000).toFixed(1)}s, final result received`
  })
}

// --- summary -------------------------------------------------------------------

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length ? 1 : 0)

#!/usr/bin/env node
/**
 * Try the deployed MCP server.
 * Usage: ENDPOINT=<POST endpoint from deploy output> node client.mjs
 */
const ENDPOINT = process.env.ENDPOINT
if (!ENDPOINT) {
  console.error('Set ENDPOINT to the POST endpoint printed by `serverless deploy`')
  process.exit(1)
}

const META = {
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientInfo': { name: 'example-client', version: '1.0.0' },
  'io.modelcontextprotocol/clientCapabilities': {},
}
let id = 0

async function call(method, params, name) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      'mcp-protocol-version': '2026-07-28',
      'mcp-method': method,
      ...(name && { 'mcp-name': name }),
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
  })
  console.log(`\n=== ${method}${name ? ` (${name})` : ''} -> HTTP ${res.status} (${res.headers.get('content-type')}) ===`)
  if (!res.headers.get('content-type')?.includes('text/event-stream')) {
    console.log((await res.text()).slice(0, 800))
    return
  }
  // SSE: print each event as it arrives, with timing
  const t0 = Date.now()
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let idx
    while ((idx = buffer.indexOf('\n\n')) >= 0) {
      const data = buffer.slice(0, idx).split('\n').find((l) => l.startsWith('data:'))?.slice(5).trim()
      buffer = buffer.slice(idx + 2)
      if (data) console.log(`[+${Date.now() - t0}ms]`, data.slice(0, 160))
    }
  }
}

// Plain JSON responses - streaming mode carries these unchanged:
await call('tools/list', { _meta: META })
await call('tools/call', { name: 'add', arguments: { a: 2, b: 40 }, _meta: META }, 'add')

// A streaming SSE response - progress notifications arrive before the result:
await call(
  'tools/call',
  {
    name: 'slow_report',
    arguments: { steps: 3, progressToken: 'demo' },
    _meta: { ...META, progressToken: 'demo' },
  },
  'slow_report',
)

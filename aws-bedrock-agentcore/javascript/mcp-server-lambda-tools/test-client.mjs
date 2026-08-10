#!/usr/bin/env node
/**
 * Test client for the deployed MCP gateway (AWS_IAM authorization).
 * Signs requests with SigV4 using your local AWS credentials.
 *
 * Usage:
 *   GATEWAY_URL=<AgentCoreGatewayUrl from deploy output> node test-client.mjs
 */
import { SignatureV4 } from '@smithy/signature-v4'
import { HttpRequest } from '@smithy/protocol-http'
import { Sha256 } from '@aws-crypto/sha256-js'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

const GATEWAY_URL = process.env.GATEWAY_URL
if (!GATEWAY_URL) {
  console.error('Set GATEWAY_URL to the URL printed by `serverless deploy`')
  process.exit(1)
}
const url = new URL(GATEWAY_URL)
const REGION = process.env.AWS_REGION || 'us-east-1'

const signer = new SignatureV4({
  service: 'bedrock-agentcore',
  region: REGION,
  credentials: defaultProvider(),
  sha256: Sha256,
})

const META = {
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientInfo': { name: 'test-client', version: '1.0.0' },
  'io.modelcontextprotocol/clientCapabilities': {},
}

let id = 0
async function rpc(method, params, name) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params })
  const request = new HttpRequest({
    method: 'POST',
    protocol: url.protocol,
    hostname: url.hostname,
    path: url.pathname,
    headers: {
      host: url.hostname,
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      'mcp-protocol-version': '2026-07-28',
      'mcp-method': method,
      ...(name && { 'mcp-name': name }),
    },
    body,
  })
  const signed = await signer.sign(request)
  const res = await fetch(GATEWAY_URL, { method: 'POST', headers: signed.headers, body })
  console.log(`\n=== ${method}${name ? ` (${name})` : ''} -> HTTP ${res.status} ===`)
  console.log((await res.text()).slice(0, 1200))
}

await rpc('server/discover', { _meta: META })
await rpc('tools/list', { _meta: META })
// Tool names are namespaced by their gateway target: <target>___<tool>
await rpc('tools/call', { name: 'calculator___add', arguments: { a: 2, b: 40 }, _meta: META }, 'calculator___add')

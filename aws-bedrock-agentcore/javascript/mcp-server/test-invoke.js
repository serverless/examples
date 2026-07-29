#!/usr/bin/env node
/**
 * Test script for the MCP Server deployed to AgentCore Runtime.
 *
 * Calls the runtime's HTTPS MCP endpoint directly - the same way real MCP
 * clients connect - using the stateless MCP 2026-07-28 protocol: every
 * request is self-contained, with the required Mcp-* headers attached and
 * no session bookkeeping. Requests are signed with SigV4 (IAM inbound auth,
 * the runtime default).
 *
 * Usage:
 *   ENDPOINT=<agent URL from deploy output> node test-invoke.js
 */

import { SignatureV4 } from '@smithy/signature-v4'
import { HttpRequest } from '@smithy/protocol-http'
import { Sha256 } from '@aws-crypto/sha256-js'
import { defaultProvider } from '@aws-sdk/credential-provider-node'

const ENDPOINT = process.env.ENDPOINT
const REGION = process.env.AWS_REGION || 'us-east-1'

if (!ENDPOINT) {
  console.error('Error: ENDPOINT environment variable is required.')
  console.error('Usage: ENDPOINT=<agent URL from deploy output> node test-invoke.js')
  process.exit(1)
}

// The runtime URL embeds the agent ARN - the WHOLE ARN must be URL-encoded in
// the path (including its inner "/"), and MCP-protocol runtimes serve under
// /invocations?qualifier=DEFAULT.
const raw = new URL(ENDPOINT)
const arn = decodeURIComponent(raw.pathname.match(/\/runtimes\/(.+)\/invocations/)[1])
const url = new URL(`${raw.origin}/runtimes/${encodeURIComponent(arn)}/invocations`)
if (!url.searchParams.has('qualifier')) url.searchParams.set('qualifier', 'DEFAULT')

const signer = new SignatureV4({
  service: 'bedrock-agentcore',
  region: REGION,
  credentials: defaultProvider(),
  sha256: Sha256,
})

// The per-request envelope required by protocol revision 2026-07-28:
const META = {
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientInfo': { name: 'test-client', version: '1.0.0' },
  'io.modelcontextprotocol/clientCapabilities': {},
}

let id = 0
async function invoke(method, params = {}, toolName) {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: ++id,
    method,
    params: { ...params, _meta: { ...META, ...(params._meta ?? {}) } },
  })
  const request = new HttpRequest({
    method: 'POST',
    protocol: url.protocol,
    hostname: url.hostname,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
    headers: {
      host: url.hostname,
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      'mcp-protocol-version': '2026-07-28',
      'mcp-method': method,
      ...(toolName && { 'mcp-name': toolName }),
    },
    body,
  })
  const signed = await signer.sign(request)
  const res = await fetch(`${url.origin}${url.pathname}?${url.searchParams}`, {
    method: 'POST',
    headers: signed.headers,
    body,
  })
  const text = await res.text()
  // Responses may arrive as plain JSON or as a single SSE event
  const data = text.startsWith('event:') || text.startsWith('data:')
    ? text.split('\n').find((l) => l.startsWith('data:'))?.slice(5)
    : text
  return { status: res.status, ...JSON.parse(data) }
}

async function main() {
  console.log('MCP Server Test Suite (stateless, protocol 2026-07-28)')
  console.log(`Endpoint: ${url.origin}${url.pathname}`)
  console.log('='.repeat(50) + '\n')

  console.log('=== server/discover ===')
  const discover = await invoke('server/discover')
  console.log('Supported versions:', discover.result?.supportedVersions)
  console.log()

  console.log('=== tools/list ===')
  const list = await invoke('tools/list')
  for (const tool of list.result?.tools ?? []) {
    console.log(`  - ${tool.name}: ${tool.description}`)
  }
  console.log()

  const calls = [
    ['add', { a: 5, b: 3 }],
    ['multiply', { a: 4, b: 7 }],
    ['get_current_time', { timezone: 'Europe/Warsaw' }],
  ]
  for (const [name, args] of calls) {
    console.log(`=== tools/call: ${name}(${JSON.stringify(args)}) ===`)
    const result = await invoke('tools/call', { name, arguments: args }, name)
    const text = result.result?.content?.[0]?.text ?? JSON.stringify(result.result ?? result.error)
    console.log(`  Result: ${text}`)
    if (result.result?.structuredContent) {
      console.log(`  Structured: ${JSON.stringify(result.result.structuredContent)}`)
    }
    console.log()
  }

  console.log('All tests completed.')
}

main().catch((err) => {
  console.error('Test failed:', err.message)
  process.exit(1)
})

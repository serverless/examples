#!/usr/bin/env node
/**
 * Test script to invoke the MCP Server deployed to AgentCore Runtime.
 *
 * Uses the stateless MCP 2026-07-28 protocol: every request is
 * self-contained - no initialize handshake and no session bookkeeping.
 *
 * Usage:
 *   RUNTIME_ARN=arn:aws:bedrock-agentcore:... node test-invoke.js
 */

import {
  BedrockAgentCoreClient,
  InvokeAgentRuntimeCommand,
} from '@aws-sdk/client-bedrock-agentcore'

const RUNTIME_ARN = process.env.RUNTIME_ARN
const REGION = process.env.AWS_REGION || 'us-east-1'

if (!RUNTIME_ARN) {
  console.error('Error: RUNTIME_ARN environment variable is required.')
  console.error('Usage: RUNTIME_ARN=<your-runtime-arn> node test-invoke.js')
  console.error('\nGet your runtime ARN from: serverless info')
  process.exit(1)
}

const client = new BedrockAgentCoreClient({ region: REGION })

// The per-request envelope required by protocol revision 2026-07-28:
const META = {
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientInfo': { name: 'test-client', version: '1.0.0' },
  'io.modelcontextprotocol/clientCapabilities': {},
}

let id = 0
async function invoke(method, params = {}) {
  const payload = {
    jsonrpc: '2.0',
    id: ++id,
    method,
    params: { ...params, _meta: { ...META, ...(params._meta ?? {}) } },
  }
  const command = new InvokeAgentRuntimeCommand({
    agentRuntimeArn: RUNTIME_ARN,
    qualifier: 'DEFAULT',
    payload: Buffer.from(JSON.stringify(payload)),
    contentType: 'application/json',
    accept: 'application/json, text/event-stream',
  })
  const response = await client.send(command)
  return JSON.parse(await streamToString(response.response))
}

async function streamToString(stream) {
  if (typeof stream === 'string') return stream
  if (stream instanceof Uint8Array || Buffer.isBuffer(stream)) {
    return new TextDecoder().decode(stream)
  }
  const chunks = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk))
  }
  return chunks.join('')
}

async function main() {
  console.log('MCP Server Test Suite (stateless, protocol 2026-07-28)')
  console.log(`Runtime ARN: ${RUNTIME_ARN}`)
  console.log(`Region: ${REGION}`)
  console.log('='.repeat(50) + '\n')

  console.log('=== server/discover ===')
  const discover = await invoke('server/discover')
  console.log('Server:', discover.result?.serverInfo?.name, discover.result?.serverInfo?.version)
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
    const result = await invoke('tools/call', { name, arguments: args })
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

/**
 * MCP Server for AWS Bedrock AgentCore Runtime.
 *
 * Serves the canonical aws-mcp-servers example server (src/server.mjs) -
 * built with the official MCP TypeScript SDK v2, speaking the stateless MCP
 * 2026-07-28 protocol revision, with the SDK's built-in fallback for older
 * clients on the same endpoint.
 *
 * AgentCore Runtime expects the MCP endpoint on port 8000 at /mcp.
 * toNodeHandler adapts Node's req/res to the SDK's web-standard handler.
 * The platform adds an Mcp-Session-Id header for its own session isolation;
 * stateless servers accept and ignore it.
 */
import { createServer } from 'node:http'
import { toNodeHandler } from '@modelcontextprotocol/node'
import mcp from './src/server.mjs'

const PORT = 8000
const node = toNodeHandler(mcp)

createServer((req, res) => {
  if (!req.url?.startsWith('/mcp')) {
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'not found' }))
    return
  }
  node(req, res)
}).listen(PORT, '0.0.0.0', () => {
  console.log(`MCP server running on http://0.0.0.0:${PORT}/mcp`)
})

/**
 * A real Fastify app serving the MCP handler - no Lambda-specific code at
 * all. AWS Lambda Web Adapter (baked into the container image as an
 * extension) proxies Lambda events to this HTTP server over localhost; the
 * same image runs unchanged on Fargate, App Runner, or anywhere else.
 *
 * The web framework and the packaging are independent choices: this example
 * pairs Fastify with a container image; the express-web-adapter sibling pairs
 * Express with a zip deployment. Swap either dimension without touching
 * application code.
 */
import { createMcpFastifyApp } from '@modelcontextprotocol/fastify'
import { toNodeHandler } from '@modelcontextprotocol/node'
import mcp from './server.mjs'

// host: '0.0.0.0' declares this app as intentionally exposed, which disables
// the factory's localhost DNS-rebinding protections - correct behind a cloud
// front door, where the platform already pins the Host header.
const app = createMcpFastifyApp({ host: '0.0.0.0' })

const node = toNodeHandler(mcp)
app.all('/mcp', (request, reply) => {
  // Hand the raw response over to the MCP adapter (SSE needs the real stream).
  reply.hijack()
  node(request.raw, reply.raw, request.body)
})

const port = Number(process.env.PORT ?? 8000)
await app.listen({ port, host: '0.0.0.0' })
console.log(`MCP server listening on http://0.0.0.0:${port}/mcp`)

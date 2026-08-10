/**
 * A real Express app serving the MCP handler - no Lambda-specific code at
 * all. AWS Lambda Web Adapter (configured in serverless.yml) proxies Lambda
 * events to this HTTP server over localhost; the same file runs unchanged on
 * Fargate, EC2, or your laptop.
 *
 * The web framework and the packaging are independent choices: this example
 * pairs Express with a zip deployment because zip needs no Docker; the
 * fastify-container sibling pairs Fastify with a container image. Swap either
 * dimension without touching application code.
 */
import { createMcpExpressApp } from '@modelcontextprotocol/express'
import { toNodeHandler } from '@modelcontextprotocol/node'
import mcp from './server.mjs'

// host: '0.0.0.0' declares this app as intentionally exposed, which disables
// the factory's localhost DNS-rebinding protections - correct behind a cloud
// front door, where the platform already pins the Host header.
const app = createMcpExpressApp({ host: '0.0.0.0' })

// createMcpExpressApp installs express.json(), so the parsed body rides
// along. Forward it only for POST: express.json() defaults req.body to {}
// on bodyless requests, and a present-but-empty parsed body changes how the
// handler classifies them.
const node = toNodeHandler(mcp)
app.all('/mcp', (req, res) => node(req, res, req.method === 'POST' ? req.body : undefined))

const port = Number(process.env.PORT ?? 8000)
app.listen(port, () => console.log(`MCP server listening on http://0.0.0.0:${port}/mcp`))

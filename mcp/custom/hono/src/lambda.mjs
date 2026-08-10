/**
 * The whole Lambda bridge - no hand-written event or stream mapping:
 * Hono's own aws-lambda adapter (streamHandle) converts Lambda events to
 * web-standard Requests and pumps the Response into the Lambda response
 * stream, and the MCP handler's fetch face plugs straight into a route.
 * streamHandle dispatches on the event shape, so the same export works
 * behind a Function URL, API Gateway (REST or HTTP API), and ALB.
 */
import { createMcpHonoApp } from '@modelcontextprotocol/hono'
import { streamHandle } from 'hono/aws-lambda'
import mcp from './server.mjs'

// host: '0.0.0.0' declares this app as intentionally exposed, which disables
// the factory's localhost DNS-rebinding protections - correct behind a cloud
// front door, where the platform already pins the Host header. (It logs a
// one-line warning per cold start.) Serving the same app locally or behind a
// custom domain? Use createMcpHonoApp({ allowedHosts: ['api.example.com'] }).
const app = createMcpHonoApp({ host: '0.0.0.0' })

app.all('/mcp', (c) => mcp.fetch(c.req.raw, { parsedBody: c.get('parsedBody') }))

export const handler = streamHandle(app)

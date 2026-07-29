/**
 * MCP Server for AWS Bedrock AgentCore Runtime
 *
 * Built with the official MCP TypeScript SDK v2, serving the stateless
 * MCP `2026-07-28` protocol revision - and answering older MCP clients
 * through the SDK's built-in fallback on the same endpoint.
 *
 * Tools:
 *   - add: Add two numbers
 *   - multiply: Multiply two numbers
 *   - get_current_time: Get the current date and time
 */

import { createServer } from 'node:http'
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server'
import { toNodeHandler } from '@modelcontextprotocol/node'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// MCP server factory - the handler creates a fresh instance per request
// ---------------------------------------------------------------------------

const mcpHandler = createMcpHandler(() => {
  const server = new McpServer({ name: 'mcp-server', version: '1.0.0' })

  server.registerTool(
    'add',
    {
      title: 'Addition',
      description: 'Add two numbers together',
      inputSchema: z.object({
        a: z.number().describe('First number'),
        b: z.number().describe('Second number'),
      }),
      outputSchema: z.object({ sum: z.number() }),
    },
    async ({ a, b }) => {
      const output = { sum: a + b }
      return {
        content: [{ type: 'text', text: String(output.sum) }],
        structuredContent: output, // typed results for structured-output clients
      }
    },
  )

  server.registerTool(
    'multiply',
    {
      title: 'Multiplication',
      description: 'Multiply two numbers together',
      inputSchema: z.object({
        a: z.number().describe('First number'),
        b: z.number().describe('Second number'),
      }),
      outputSchema: z.object({ product: z.number() }),
    },
    async ({ a, b }) => {
      const output = { product: a * b }
      return {
        content: [{ type: 'text', text: String(output.product) }],
        structuredContent: output,
      }
    },
  )

  server.registerTool(
    'get_current_time',
    {
      title: 'Current Time',
      description: 'Get the current date and time. Optionally specify a timezone.',
      inputSchema: z.object({
        timezone: z
          .string()
          .optional()
          .describe('Timezone (e.g. "America/New_York", "Europe/London", "UTC")'),
      }),
    },
    async ({ timezone }) => {
      const now = new Date().toLocaleString('en-US', {
        timeZone: timezone || 'UTC',
        dateStyle: 'full',
        timeStyle: 'long',
      })
      return { content: [{ type: 'text', text: now }] }
    },
  )

  // -------------------------------------------------------------------------
  // More SDK capabilities to explore (uncomment and adapt):
  // -------------------------------------------------------------------------

  // Progress notifications - long-running tools can stream progress over SSE
  // to clients that request it (a progressToken in the request's _meta):
  //
  // server.registerTool(
  //   'slow_report',
  //   {
  //     description: 'Generate a report, reporting progress along the way',
  //     inputSchema: z.object({ steps: z.number().default(3), progressToken: z.string().optional() }),
  //   },
  //   async ({ steps, progressToken }, ctx) => {
  //     for (let i = 1; i <= steps; i++) {
  //       await new Promise((resolve) => setTimeout(resolve, 800))
  //       if (progressToken) {
  //         await ctx.mcpReq.notify({
  //           method: 'notifications/progress',
  //           params: { progressToken, progress: i, total: steps, message: `step ${i}` },
  //         })
  //       }
  //     }
  //     return { content: [{ type: 'text', text: `completed ${steps} steps` }] }
  //   },
  // )

  // Elicitation - pause a tool call to ask the user for input; the client
  // retries the request with the answers attached (multi round-trip requests):
  //
  // (also add acceptedContent and inputRequired to the imports above)
  //
  // server.registerTool(
  //   'approve_action',
  //   {
  //     description: 'Perform an action after user confirmation',
  //     inputSchema: z.object({ action: z.string() }),
  //   },
  //   async ({ action }, ctx) => {
  //     // First pass: no answers yet - return input_required so the client
  //     // asks the user and retries this call with the responses attached.
  //     const answer = acceptedContent(ctx.mcpReq.inputResponses, 'confirm', z.object({ confirmed: z.boolean() }))
  //     if (answer === undefined) {
  //       return inputRequired({
  //         inputRequests: {
  //           confirm: inputRequired.elicit({
  //             message: `Proceed with ${action}?`,
  //             requestedSchema: z.object({ confirmed: z.boolean() }),
  //           }),
  //         },
  //       })
  //     }
  //     // Re-entry: the retried request carries the user's answer.
  //     if (!answer.confirmed) {
  //       return { content: [{ type: 'text', text: 'cancelled' }] }
  //     }
  //     return { content: [{ type: 'text', text: `${action} done` }] }
  //   },
  // )

  // Resources - expose readable documents next to tools:
  //
  // server.registerResource(
  //   'status',
  //   'status://server',
  //   { description: 'Server status document' },
  //   async () => ({ contents: [{ uri: 'status://server', text: 'all good' }] }),
  // )

  return server
})

// ---------------------------------------------------------------------------
// HTTP layer - AgentCore Runtime expects the MCP endpoint on port 8000
// at /mcp. toNodeHandler adapts Node's req/res to the SDK's web-standard
// handler. The platform adds an Mcp-Session-Id header for its own session
// isolation; stateless servers accept and ignore it.
// ---------------------------------------------------------------------------

const PORT = 8000
const node = toNodeHandler(mcpHandler)

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

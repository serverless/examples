/**
 * A standard MCP server built with the official MCP TypeScript SDK v2.
 * Nothing in this file is Lambda-specific - the same handler runs on any
 * web-standard host; src/lambda.mjs adapts it to Lambda.
 */
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default createMcpHandler(() => {
  const server = new McpServer({ name: 'aws-node-mcp-server', version: '1.0.0' })

  // A plain tool: zod schemas next to the implementation; returning
  // structuredContent lets clients consume typed results.
  server.registerTool(
    'add',
    {
      description: 'Add two numbers',
      inputSchema: z.object({ a: z.number(), b: z.number() }),
      outputSchema: z.object({ sum: z.number() }),
    },
    async ({ a, b }) => {
      const output = { sum: a + b }
      return {
        content: [{ type: 'text', text: String(output.sum) }],
        structuredContent: output,
      }
    },
  )

  // A long-running tool emitting progress notifications. When the client
  // requests progress (a progressToken in _meta) and accepts text/event-stream,
  // the response is served as SSE with notifications ahead of the final result.
  server.registerTool(
    'slow_report',
    {
      description: 'Generate a report, reporting progress along the way',
      inputSchema: z.object({ steps: z.number().default(3), progressToken: z.string().optional() }),
    },
    async ({ steps, progressToken }, ctx) => {
      for (let i = 1; i <= steps; i++) {
        await sleep(800)
        if (progressToken) {
          await ctx.mcpReq.notify({
            method: 'notifications/progress',
            params: { progressToken, progress: i, total: steps, message: `step ${i}` },
          })
        }
      }
      return { content: [{ type: 'text', text: `completed ${steps} steps` }] }
    },
  )

  // -------------------------------------------------------------------------
  // More SDK capabilities to explore (uncomment and adapt):
  // -------------------------------------------------------------------------

  // Elicitation - pause a tool call to ask the user for input (the client
  // retries the request with the answers attached; protect the round-trip
  // state with the SDK's requestState codec - see its docs):
  //
  // server.registerTool(
  //   'approve_refund',
  //   {
  //     description: 'Refund an order after user confirmation',
  //     inputSchema: z.object({ orderId: z.string() }),
  //   },
  //   async ({ orderId }, ctx) => {
  //     const result = await ctx.mcpReq.elicitInput({
  //       mode: 'form',
  //       message: `Refund order ${orderId}?`,
  //       requestedSchema: {
  //         type: 'object',
  //         properties: { confirmed: { type: 'boolean' } },
  //         required: ['confirmed'],
  //       },
  //     })
  //     if (result.action !== 'accept' || !result.content?.confirmed) {
  //       return { content: [{ type: 'text', text: 'refund cancelled' }] }
  //     }
  //     return { content: [{ type: 'text', text: `refunded ${orderId}` }] }
  //   },
  // )

  // Resources - expose readable documents next to tools:
  //
  // server.registerResource(
  //   'orders',
  //   'orders://recent',
  //   { description: 'Recent orders' },
  //   async () => ({ contents: [{ uri: 'orders://recent', text: JSON.stringify([]) }] }),
  // )

  return server
})

// ---------------------------------------------------------------------------
// In-process OAuth (alternative to an API Gateway authorizer): the SDK ships
// bearer-token middleware and OAuth discovery-document helpers. Wrap the
// handler's fetch face before exporting - any OIDC provider works:
//
// import { requireBearerAuth, oauthMetadataResponse } from '@modelcontextprotocol/server'
// import { createRemoteJWKSet, jwtVerify } from 'jose'
//
// const jwks = createRemoteJWKSet(new URL('https://<your-idp>/.well-known/jwks.json'))
// const verifier = {
//   async verifyAccessToken(token) {
//     const { payload } = await jwtVerify(token, jwks, {
//       issuer: 'https://<your-idp>/',
//       audience: 'https://<your-mcp-endpoint>',
//     })
//     return { token, clientId: payload.azp, scopes: payload.scope?.split(' ') ?? [], expiresAt: payload.exp }
//   },
// }

/**
 * A standard MCP server built with the official MCP TypeScript SDK v2,
 * serving the stateless MCP 2026-07-28 protocol revision (and answering
 * older clients through the SDK's built-in fallback on the same endpoint).
 *
 * Nothing in this file is Lambda-specific - the same handler runs on any
 * web-standard host. Every example in mcp/custom/ serves this exact
 * server; only the hosting glue around it differs.
 *
 * Surface:
 *   tools:     add (plain JSON), slow_report (progress streaming),
 *              approve_refund (elicitation - pauses to ask the user)
 *   resources: guide://usage, orders://{orderId} (template)
 *   prompts:   summarize_order
 *   extras:    instructions (served via server/discover), cache hints
 */
import {
  acceptedContent,
  createMcpHandler,
  inputRequired,
  inputResponse,
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/server'
import { z } from 'zod'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default createMcpHandler(() => {
  const server = new McpServer(
    { name: 'aws-mcp-server', version: '1.0.0' },
    {
      // Shown to clients that probe the server/discover method:
      instructions:
        'Demo MCP server. Call add for arithmetic, slow_report to watch ' +
        'streamed progress, approve_refund to see a tool ask the user for ' +
        'confirmation mid-call. Read guide://usage for a walkthrough.',
      // Cache hints: let clients and shared caches reuse the tool list for
      // five minutes. Without hints the SDK emits the conservative defaults
      // (ttlMs: 0, cacheScope: private) on every cacheable result:
      cacheHints: { 'tools/list': { ttlMs: 300000, cacheScope: 'public' } },
    },
  )

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
      inputSchema: z.object({ steps: z.number().default(3) }),
    },
    async ({ steps }, ctx) => {
      // Real clients request progress via `_meta.progressToken`, never as a
      // tool argument.
      const progressToken = ctx.mcpReq._meta?.progressToken
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

  // Elicitation - a tool that pauses to ask the user for input. The handler
  // returns an input_required result; the client asks the user and retries
  // the call with the answers attached, re-entering the handler, which reads
  // them with acceptedContent. Works statelessly - no session required.
  server.registerTool(
    'approve_refund',
    {
      description: 'Refund an order after user confirmation',
      inputSchema: z.object({ orderId: z.string() }),
    },
    async ({ orderId }, ctx) => {
      const answer = acceptedContent(
        ctx.mcpReq.inputResponses,
        'confirm',
        z.object({ confirmed: z.boolean() }),
      )
      // Decline/cancel must terminate: acceptedContent returns undefined for
      // BOTH "not asked yet" and "user said no" - without this check a decline
      // falls through to inputRequired and the client re-prompts forever.
      const confirmView = inputResponse(ctx.mcpReq.inputResponses, 'confirm')
      if (confirmView.kind === 'elicit' && confirmView.action !== 'accept') {
        return { content: [{ type: 'text', text: 'refund cancelled' }] }
      }
      if (answer === undefined) {
        return inputRequired({
          inputRequests: {
            confirm: inputRequired.elicit({
              message: `Refund order ${orderId}?`,
              requestedSchema: z.object({ confirmed: z.boolean() }),
            }),
          },
        })
      }
      if (!answer.confirmed) {
        return { content: [{ type: 'text', text: 'refund cancelled' }] }
      }
      return { content: [{ type: 'text', text: `refunded ${orderId}` }] }
    },
  )

  // A readable document next to the tools. Clients fetch it with
  // resources/read (the Mcp-Name header carries the uri).
  server.registerResource(
    'usage-guide',
    'guide://usage',
    { description: 'How to use this server', mimeType: 'text/markdown' },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: '# Usage\n\nCall `add` for sums, `slow_report` for streamed progress, `approve_refund` for an elicitation round-trip.',
        },
      ],
    }),
  )

  // A resource template - parameterized URIs resolved per request. The
  // per-resource cacheHint overrides the server-level hints for its reads.
  server.registerResource(
    'order',
    new ResourceTemplate('orders://{orderId}', { list: undefined }),
    { description: 'Order record by id', cacheHint: { ttlMs: 60000, cacheScope: 'private' } },
    async (uri, { orderId }) => ({
      contents: [{ uri: uri.href, text: JSON.stringify({ orderId, status: 'shipped' }) }],
    }),
  )

  // A prompt template clients can list and fill in.
  server.registerPrompt(
    'summarize_order',
    {
      description: 'Ask the model to summarize an order',
      argsSchema: z.object({ orderId: z.string() }),
    },
    ({ orderId }) => ({
      messages: [
        {
          role: 'user',
          content: { type: 'text', text: `Summarize the status of order ${orderId} in one sentence.` },
        },
      ],
    }),
  )

  return server
})

// ---------------------------------------------------------------------------
// Going further (uncomment and adapt):
// ---------------------------------------------------------------------------
//
// Signed round-trip state - when an elicitation round-trip must carry server
// state the retry cannot be allowed to tamper with (a computed price, an
// idempotency key), return it as requestState sealed with the SDK's HMAC
// codec. Store the >= 32-byte key in Secrets Manager or SSM:
//
// import { createRequestStateCodec } from '@modelcontextprotocol/server'
// const codec = createRequestStateCodec({ key: process.env.MCP_STATE_KEY, ttlSeconds: 600 })
//
// In-process OAuth (works identically behind every front door): the SDK ships
// bearer-token middleware and OAuth discovery-document helpers. Wrap the
// handler's fetch face before exporting - any OpenID Connect provider works:
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

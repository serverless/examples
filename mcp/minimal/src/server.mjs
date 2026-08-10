/**
 * A standard MCP server, built with the official MCP TypeScript SDK. There is
 * nothing Lambda-specific and nothing Serverless Framework-specific in here:
 * the `mcp` property packages this module with an entry that hands its default
 * export a web-standard request to answer.
 *
 * The default export must be what `createMcpHandler()` returns, and the module
 * must be ESM.
 */
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'

export default createMcpHandler(() => {
  const server = new McpServer({ name: 'demo', version: '1.0.0' })

  // An instant tool. zod schemas sit next to the implementation, and returning
  // structuredContent alongside the text lets clients consume a typed result.
  server.registerTool(
    'add',
    {
      description: 'Add two numbers',
      inputSchema: z.object({ a: z.number(), b: z.number() }),
      // .finite() with a message: an overflow to Infinity fails output
      // validation either way, but zod's default text for it ("expected
      // number, received number") is undiagnosable.
      outputSchema: z.object({
        sum: z.number().finite('a + b overflowed the double range'),
      }),
    },
    async ({ a, b }) => {
      const output = { sum: a + b }
      return {
        content: [{ type: 'text', text: String(output.sum) }],
        structuredContent: output,
      }
    },
  )

  // A slow tool that reports progress. Each notification is a write on the
  // response stream, so the client sees the work advancing instead of waiting —
  // and the connection never goes quiet long enough to be cut. Emit progress
  // from any tool that takes more than a moment; a tool running longer than
  // ~300 seconds has to, whatever its `timeout` is.
  server.registerTool(
    'slow_report',
    {
      description: 'Generate a report, reporting progress along the way',
      // Bounded on purpose: nothing else stops steps: 9e15, and the only
      // backstop past the schema is the function timeout.
      inputSchema: z.object({ steps: z.number().int().min(1).max(60).default(5) }),
    },
    async ({ steps }, ctx) => {
      // Clients that want progress send a token with the call; ones that do not
      // get the same result without the notifications.
      const progressToken = ctx.mcpReq._meta?.progressToken
      for (let step = 1; step <= steps; step++) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        if (progressToken !== undefined) {
          await ctx.mcpReq.notify({
            method: 'notifications/progress',
            params: {
              progressToken,
              progress: step,
              total: steps,
              message: `step ${step}`,
            },
          })
        }
      }
      return {
        content: [
          {
            type: 'text',
            text: `completed ${steps} ${steps === 1 ? 'step' : 'steps'}`,
          },
        ],
      }
    },
  )

  return server
})

<!--
title: 'AWS MCP Server on Lambda Function URL (NodeJS)'
description: Run an MCP server built with the official MCP TypeScript SDK on a Lambda Function URL with response streaming - no API Gateway.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server on a Lambda Function URL

Run a [Model Context Protocol](https://modelcontextprotocol.io) server built with the **official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)** on a Lambda Function URL with response streaming — the leanest MCP hosting on AWS: no API Gateway, no per-request fee, and streamed responses bounded only by the function timeout.

The MCP `2026-07-28` protocol revision made servers stateless — every request is self-contained, so any request can be served by any Lambda execution environment. Three parts:

- **`src/server.mjs`** — a standard SDK v2 server (`createMcpHandler` + `registerTool` with zod schemas). Nothing Lambda-specific.
- **`src/lambda.mjs`** — ~80 lines of adapter glue mapping the Function URL event and the Lambda response stream onto the Node-style shapes that `@modelcontextprotocol/node` accepts. No MCP logic.
- **`serverless.yml`** — a Function URL with `invokeMode: RESPONSE_STREAM`.

Plain JSON and streaming SSE coexist on the one endpoint: simple tool calls return ordinary `application/json`, while calls that request progress stream `text/event-stream` with notifications arriving ahead of the final result.

**Related example:** [`aws-node-mcp-server`](../aws-node-mcp-server) serves the same MCP server through an API Gateway REST API in stream mode instead — pick that one when you want a custom domain, WAF, throttling, or an authorizer that rejects requests before they invoke the function; pick this one for the simplest and cheapest setup.

## Usage

### Deploy

```bash
npm install
serverless deploy
```

### Test

```bash
ENDPOINT=<function URL from deploy output> node client.mjs
```

The client demonstrates both response modes:

```
=== tools/call (add) -> HTTP 200 (application/json) ===
{"result":{"content":[{"type":"text","text":"42"}],"structuredContent":{"sum":42},"resultType":"complete",...}}

=== tools/call (slow_report) -> HTTP 200 (text/event-stream) ===
[+1200ms] {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"demo","progress":1,"total":3,...}}
[+2000ms] {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"demo","progress":2,"total":3,...}}
[+2800ms] {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"demo","progress":3,"total":3,...}}
[+2800ms] {"result":{"content":[{"type":"text","text":"completed 3 steps"}],"resultType":"complete",...}}
```

Older MCP clients that still send the `initialize` handshake are answered too — the SDK serves earlier protocol revisions on the same endpoint by default.

### Going further

The example is deliberately minimal; commented blocks show how to extend it:

- **Authentication** (`serverless.yml` + `src/server.mjs`): set `authorizer: aws_iam` for SigV4 callers, or keep the URL open and validate OAuth Bearer tokens in-process with the SDK's `requireBearerAuth` and a `jose`-based verifier — works with any OpenID Connect provider.
- **Elicitation** (`src/server.mjs`): a tool can pause mid-call and ask the user for input by returning `inputRequired(...)`; the client asks the user and retries the call with the answers attached, and the handler reads them with `acceptedContent(...)` on re-entry.
- **Resources**: expose readable documents next to tools with `registerResource`.
- **Long-running tools**: raise the function `timeout` — streamed responses run up to 15 minutes with no other configuration.

### Cleanup

```bash
serverless remove
```

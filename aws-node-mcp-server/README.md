<!--
title: 'AWS MCP Server on Lambda (NodeJS)'
description: Run an MCP server built with the official MCP TypeScript SDK on AWS Lambda, with streaming responses through API Gateway.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server on AWS Lambda

Run a [Model Context Protocol](https://modelcontextprotocol.io) server built with the **official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)** on AWS Lambda, fronted by API Gateway with response streaming.

The MCP `2026-07-28` protocol revision made servers stateless — every request is self-contained, so any request can be served by any Lambda execution environment with no sessions or sticky routing. This example has three parts:

- **`src/server.mjs`** — a standard SDK v2 server (`createMcpHandler` + `registerTool` with zod schemas). Nothing Lambda-specific; the same file runs on any web-standard host.
- **`src/lambda.mjs`** — ~80 lines of adapter glue mapping the API Gateway event and the Lambda response stream onto the Node-style shapes that `@modelcontextprotocol/node` accepts. No MCP logic.
- **`serverless.yml`** — a REST API route with `response.transferMode: STREAM`, which enables Server-Sent Events and integration timeouts up to 15 minutes.

Plain JSON and streaming SSE coexist on the one endpoint: simple tool calls return ordinary `application/json` responses, while calls that request progress stream `text/event-stream` with notifications arriving ahead of the final result.

## Usage

### Deploy

```bash
npm install
serverless deploy
```

### Test

```bash
ENDPOINT=<POST endpoint from deploy output> node client.mjs
```

The client demonstrates both response modes:

```
=== tools/call (add) -> HTTP 200 (application/json) ===
{"result":{"content":[{"type":"text","text":"42"}],"structuredContent":{"sum":42},"resultType":"complete",...}}

=== tools/call (slow_report) -> HTTP 200 (text/event-stream) ===
[+1150ms] {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"demo","progress":1,"total":3,...}}
[+1950ms] {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"demo","progress":2,"total":3,...}}
[+2750ms] {"jsonrpc":"2.0","method":"notifications/progress","params":{"progressToken":"demo","progress":3,"total":3,...}}
[+2750ms] {"result":{"content":[{"type":"text","text":"completed 3 steps"}],"resultType":"complete",...}}
```

Older MCP clients that still send the `initialize` handshake are answered too — the SDK serves earlier protocol revisions on the same endpoint by default.

### Going further

The example is deliberately minimal; commented blocks show how to extend it:

- **Authentication** (`serverless.yml` + `src/server.mjs`): either attach an API Gateway authorizer that validates Bearer JWTs before the function is invoked, or use the SDK's in-process `requireBearerAuth` with a `jose`-based verifier for any OpenID Connect provider. Pair it with an unauthenticated `/.well-known/oauth-protected-resource` route (the SDK's `oauthMetadataResponse` helper builds the document) so MCP clients can discover how to log in.
- **Elicitation** (`src/server.mjs`): a tool can pause mid-call and ask the user for input by returning `inputRequired(...)`; the client asks the user and retries the call with the answers attached, and the handler reads them with `acceptedContent(...)` on re-entry.
- **Resources**: expose readable documents next to tools with `registerResource`.
- **Long-running tools**: `timeoutInMillis` on the route and the function `timeout` can be raised up to 15 minutes.

### Cleanup

```bash
serverless remove
```

<!--
title: 'AWS MCP Server behind API Gateway REST (NodeJS)'
description: Run an MCP server built with the official MCP TypeScript SDK on AWS Lambda, with streaming responses through API Gateway REST response streaming.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server behind API Gateway REST (response streaming)

Run a [Model Context Protocol](https://modelcontextprotocol.io) server built with the **official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)** on AWS Lambda behind an API Gateway REST API in stream mode. Pick this front door when you want a custom domain, WAF, throttling, usage plans, or an authorizer that rejects requests before they invoke the function.

This is one of the [aws-mcp-servers](../README.md) examples - they all serve the **same canonical MCP server** and differ only in the hosting glue, so the same test client works against every one of them. Three parts:

- **`src/server.mjs`** - the canonical server: tools (`add`, `slow_report` with streamed progress, `approve_refund` with an elicitation round-trip), resources (`guide://usage` plus an `orders://{orderId}` template), a prompt, `instructions` served via `server/discover`, and cache hints on the tool list. Nothing Lambda-specific - the same file runs on any web-standard host.
- **`src/lambda.mjs`** - ~80 lines of adapter glue mapping the API Gateway event and the Lambda response stream onto the Node-style shapes that `@modelcontextprotocol/node` accepts. No MCP logic. (For glue-free alternatives built on existing packages, see the [hono](../hono) and [express-web-adapter](../express-web-adapter) examples.)
- **`serverless.yml`** - a REST API with `response.transferMode: stream` and a raised `timeoutInMillis` (streams end at the integration timeout, so lift it alongside).

Plain JSON and streaming SSE coexist on the one endpoint: simple tool calls return ordinary `application/json`, while calls that request progress stream `text/event-stream` with notifications arriving ahead of the final result.

## Usage

### Deploy

```bash
npm install
serverless deploy
```

### Test

Every example in this family ships the same test client:

```bash
ENDPOINT=<POST endpoint from deploy output> node client.mjs
```

```
PASS  1. tools/list returns the canonical tools with cache hints — ttlMs=300000 cacheScope=public
PASS  2. add returns plain JSON with structured content — sum=42
PASS  3. slow_report streams incremental progress over SSE — 3 progress events, first at +810ms
PASS  4. approve_refund elicitation round-trip (accept and cancel) — input_required -> refunded o-1 / refund cancelled
PASS  5. resources list + read (Mcp-Name carries the uri) — guide://usage readable
PASS  6. resource template read with per-resource cache hint — orders://o-42 -> shipped, ttlMs=60000
PASS  7. prompts list + get — summarize_order fills its argument
PASS  8. server/discover surfaces the instructions — instructions present
PASS  9. legacy initialize is answered on the same endpoint — served as 2025-06-18
PASS  10. GET is answered with the spec-mandated 405 — HTTP 405
PASS  11. Mcp-Method header mismatching the body is rejected (-32020) — -32020
PASS  12. elicitation without the client capability is rejected (-32021) — -32021

12/12 passed
```

Add `LONG=1` for a ~36-second streaming case proving streams run far past API Gateway's classic 29-second ceiling.

### Authentication

The demo endpoint is public. For real deployments, two options (both included):

- **Reject at the gateway** - uncomment the `authorizer` wiring in `serverless.yml`: [src/authorizer.mjs](src/authorizer.mjs) is a complete Lambda authorizer validating Bearer JWTs against any OpenID Connect provider, so unauthenticated requests never invoke (or bill) the MCP function.
- **Validate in-process** - the SDK's `requireBearerAuth` with a `jose` JWKS verifier (commented block at the bottom of `src/server.mjs`); works identically behind every front door, at the cost of unauthenticated requests still invoking the function.

### Going further

- **Signed round-trip state**: seal server state across elicitation retries with `createRequestStateCodec` (see the comment in `src/server.mjs`).
- **OAuth discovery**: serve `/.well-known/oauth-protected-resource` so MCP clients can discover your authorization server (commented route in `serverless.yml`).
- **Long-running tools**: raise the function `timeout` and `timeoutInMillis` - streamed responses run up to 15 minutes. Keep the endpoint regional (as configured): edge-optimized REST endpoints cut streams that stay idle for 30 seconds, so a tool that computes quietly for longer than that would fail there even with a raised timeout.

### Cleanup

```bash
serverless remove
```

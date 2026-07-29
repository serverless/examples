<!--
title: 'AWS MCP Server with Hono (NodeJS)'
description: Run an MCP server on AWS Lambda with the official MCP Hono integration and Hono's aws-lambda adapter - no hand-written Lambda glue at all.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server with Hono - zero custom glue

Run a [Model Context Protocol](https://modelcontextprotocol.io) server on AWS Lambda using **only existing, maintained packages** for the Lambda bridge: the MCP SDK's official [`@modelcontextprotocol/hono`](https://github.com/modelcontextprotocol/typescript-sdk/tree/main/packages/middleware/hono) integration plus [Hono](https://hono.dev)'s own `streamHandle` aws-lambda adapter. The entire Lambda-specific code is a route:

```js
const app = createMcpHonoApp({ host: '0.0.0.0' })
app.all('/mcp', (c) => mcp.fetch(c.req.raw, { parsedBody: c.get('parsedBody') }))
export const handler = streamHandle(app)
```

`streamHandle` dispatches on the incoming event shape, so this same export works behind a Function URL (used here), API Gateway (REST stream or HTTP API), and ALB.

This is one of the [aws-mcp-servers](../README.md) examples - they all serve the **same canonical MCP server** (`src/server.mjs`: tools with streamed progress and an elicitation round-trip, resources, a prompt, `server/discover` instructions, cache hints) and differ only in the hosting glue, so the same test client works against every one of them. Compare [function-url](../function-url), which does the same bridging with ~80 lines of hand-written adapter and one less dependency.

A note on `createMcpHonoApp`: its localhost Host/Origin validation exists to protect *locally running* servers from DNS rebinding. Behind a Function URL or API Gateway the platform already pins the Host header, so `host: '0.0.0.0'` (intentionally exposed) is the right setting - it logs a one-line warning per cold start. Access control for a cloud endpoint comes from the auth options below instead.

## Usage

### Deploy

```bash
npm install
serverless deploy
```

### Test

Every example in this family ships the same test client:

```bash
ENDPOINT=<function URL from deploy output>mcp node client.mjs
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

Add `LONG=1` for a ~36-second streaming case.

### Authentication

The demo endpoint is public. For real deployments (both included as comments): uncomment `authorizer: aws_iam` in `serverless.yml` for AWS-credentialed callers (the shared client tests this mode with `AUTH=sigv4 SERVICE=lambda`), or validate OAuth Bearer tokens in-process with the SDK's `requireBearerAuth` and a `jose` JWKS verifier (commented block at the bottom of `src/server.mjs`) - works with any OpenID Connect provider.

### Cleanup

```bash
serverless remove
```

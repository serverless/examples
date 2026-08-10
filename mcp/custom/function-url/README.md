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

Run a [Model Context Protocol](https://modelcontextprotocol.io) server built with the **official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)** on a Lambda Function URL with response streaming - the leanest MCP hosting on AWS: no API Gateway, no per-request fee, and streamed responses bounded only by the function timeout.

This is one of the [custom MCP hosting](../README.md) examples - they all serve the **same canonical MCP server** and differ only in the hosting glue, so the same test client works against every one of them. Three parts:

- **`src/server.mjs`** - the canonical server: tools (`add`, `slow_report` with streamed progress, `approve_refund` with an elicitation round-trip), resources (`guide://usage` plus an `orders://{orderId}` template), a prompt, `instructions` served via `server/discover`, and cache hints on the tool list. Nothing Lambda-specific.
- **`src/lambda.mjs`** - ~80 lines of adapter glue mapping the Function URL event and the Lambda response stream onto the Node-style shapes that `@modelcontextprotocol/node` accepts. No MCP logic. (For glue-free alternatives built on existing packages, see the [hono](../hono) and [express-web-adapter](../express-web-adapter) examples.)
- **`serverless.yml`** - a Function URL with `invokeMode: RESPONSE_STREAM`.

Plain JSON and streaming SSE coexist on the one endpoint. **Related:** [rest-api](../rest-api) serves the same server through API Gateway REST in stream mode - pick that one when you want a custom domain, WAF, throttling, or an authorizer that rejects requests before they invoke the function; pick this one for the simplest and cheapest setup.

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

Add `LONG=1` for a ~36-second streaming case - on Function URLs no extra timeout configuration is needed; the function `timeout` is the only bound.

### Authentication

The demo endpoint is public. For real deployments, two options (both included as comments):

- **IAM (SigV4)** - uncomment `authorizer: aws_iam` in `serverless.yml` for AWS-credentialed callers; the shared client tests this mode with `AUTH=sigv4 SERVICE=lambda`.
- **Validate in-process** - the SDK's `requireBearerAuth` with a `jose` JWKS verifier (commented block at the bottom of `src/server.mjs`) validates OAuth Bearer tokens from any OpenID Connect provider.

### Going further

- **Signed round-trip state**: seal server state across elicitation retries with `createRequestStateCodec` (see the comment in `src/server.mjs`).
- **Long-running tools**: raise the function `timeout` - streamed responses run up to 15 minutes with no other configuration.

### Cleanup

```bash
serverless remove
```

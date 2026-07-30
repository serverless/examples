<!--
title: 'AWS MCP Server with Express and Lambda Web Adapter (NodeJS)'
description: Run an MCP server as a plain Express app on AWS Lambda with Lambda Web Adapter - zip deployment, streaming through API Gateway REST.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server with Express + Lambda Web Adapter

Run a [Model Context Protocol](https://modelcontextprotocol.io) server as a **plain Express app** on AWS Lambda. [AWS Lambda Web Adapter](https://github.com/aws/aws-lambda-web-adapter) (a public layer configured entirely in `serverless.yml`) proxies Lambda events to the HTTP server over localhost - the application code contains nothing Lambda-specific and runs unchanged on Fargate, EC2, or your laptop. The Express integration is the MCP SDK's official [`@modelcontextprotocol/express`](https://github.com/modelcontextprotocol/typescript-sdk/tree/main/packages/middleware/express) package.

> **The web framework and the packaging are independent choices.** This example pairs Express with a **zip** deployment because zip needs no Docker; the [fastify-container](../fastify-container) sibling pairs Fastify with a **container image**. Swap either dimension - Express in a container, Fastify in a zip - without touching application code.

This is one of the [aws-mcp-servers](../README.md) examples - they all serve the **same canonical MCP server** (`src/server.mjs`) and differ only in the hosting glue, so the same test client works against every one of them.

How the pieces fit:

- **`src/index.mjs`** - `createMcpExpressApp()` + one route mounting the MCP handler via `toNodeHandler`, listening on `PORT`.
- **`run.sh`** - the Lambda "handler": the adapter layer's exec wrapper runs it to boot the HTTP server, then forwards invocations to it.
- **`serverless.yml`** - the Lambda Web Adapter layer + `AWS_LWA_INVOKE_MODE: response_stream`, behind API Gateway REST with `response.transferMode: stream` (streaming works end to end, SSE included).

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

You can also run the server locally - it is just an Express app:

```bash
PORT=8000 node src/index.mjs
ENDPOINT=http://localhost:8000/mcp node client.mjs
```

### Authentication

The demo endpoint is public. For real deployments (both included):

- **Reject at the gateway** - uncomment the `authorizer` wiring in `serverless.yml`: [src/authorizer.mjs](src/authorizer.mjs) is a complete Lambda authorizer validating Bearer JWTs against any OpenID Connect provider.
- **Validate in-process** - the SDK's `requireBearerAuth` with a `jose` JWKS verifier (commented block at the bottom of `src/server.mjs`).
- Behind an IAM-auth Function URL, the adapter's `AWS_LWA_AUTHORIZATION_SOURCE` can restore a client-supplied token from another header into `Authorization` (SigV4 reserves the original).

### Going further

- **Long-running tools**: raise the function `timeout` and `timeoutInMillis` together. Keep the endpoint regional (as configured): edge-optimized REST endpoints cut streams that stay idle for 30 seconds, so a tool that computes quietly for longer than that would fail there even with a raised timeout.

### Cleanup

```bash
serverless remove
```

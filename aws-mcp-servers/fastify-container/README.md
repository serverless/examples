<!--
title: 'AWS MCP Server with Fastify in a Container Image (NodeJS)'
description: Run an MCP server as a containerized Fastify app on AWS Lambda with Lambda Web Adapter - the same image runs on Fargate or anywhere else.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server with Fastify in a container image

Run a [Model Context Protocol](https://modelcontextprotocol.io) server as a **containerized Fastify app** on AWS Lambda. The subject of this example is the packaging: a portable container image whose only Lambda-specific line is the [AWS Lambda Web Adapter](https://github.com/aws/aws-lambda-web-adapter) extension `COPY` in the Dockerfile - the same image runs unchanged on Fargate, App Runner, or any container host. The Fastify integration is the MCP SDK's official [`@modelcontextprotocol/fastify`](https://github.com/modelcontextprotocol/typescript-sdk/tree/main/packages/middleware/fastify) package.

> **The web framework and the packaging are independent choices.** This example pairs Fastify with a **container image**; the [express-web-adapter](../express-web-adapter) sibling pairs Express with a **zip** deployment (no Docker needed). Swap either dimension - Fastify in a zip, Express in a container - without touching application code.

This is one of the [aws-mcp-servers](../README.md) examples - they all serve the **same canonical MCP server** (`src/server.mjs`) and differ only in the hosting glue, so the same test client works against every one of them.

How the pieces fit:

- **`src/index.mjs`** - `createMcpFastifyApp()` + one route mounting the MCP handler via `toNodeHandler` (with `reply.hijack()` so SSE streams flow on the raw response), listening on `PORT`.
- **`Dockerfile`** - `node:22-slim` + the Lambda Web Adapter extension + the app. `AWS_LWA_INVOKE_MODE=response_stream` streams responses end to end.
- **`serverless.yml`** - an ECR image build (`provider.ecr.images`) wired to the function, served on a Function URL with `invokeMode: RESPONSE_STREAM`.

## Usage

### Deploy

Docker must be running - deploying builds the image and pushes it to ECR:

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

Add `LONG=1` for a ~36-second streaming case - on Function URLs the function `timeout` is the only bound.

You can also run the server locally - it is just a Fastify app (or `docker build` and run the image):

```bash
PORT=8000 node src/index.mjs
ENDPOINT=http://localhost:8000/mcp node client.mjs
```

### Authentication

The demo endpoint is public. For real deployments (both included as comments): uncomment `authorizer: aws_iam` in `serverless.yml` for AWS-credentialed callers (the shared client tests this mode with `AUTH=sigv4 SERVICE=lambda`), or validate OAuth Bearer tokens in-process with the SDK's `requireBearerAuth` and a `jose` JWKS verifier (commented block at the bottom of `src/server.mjs`).

### Cleanup

```bash
serverless remove
```

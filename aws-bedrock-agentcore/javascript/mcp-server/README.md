<!--
title: 'Bedrock AgentCore: Standalone MCP Server (JavaScript)'
description: Standalone JavaScript MCP server deployed to AWS Bedrock AgentCore Runtime, consumable by any MCP client.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# MCP Server Example

A JavaScript MCP server deployed to AWS Bedrock AgentCore Runtime. Exposes tools via the [Model Context Protocol](https://modelcontextprotocol.io/) that can be consumed by any MCP client (Cursor, Claude Desktop, Amazon Q CLI, etc.).

It serves the same canonical MCP server as the [aws-mcp-servers](../../../aws-mcp-servers/README.md) example family - tools (`add`, `slow_report` with streamed progress, `approve_refund` with an elicitation round-trip), resources (`guide://usage` plus an `orders://{orderId}` template), a prompt, `instructions` served via `server/discover`, and cache hints - so the family's shared test client works here too, and you can compare hosting on AgentCore Runtime against the Lambda-based options side by side.

## Prerequisites

- Node.js 24.x
- AWS account with credentials configured
- Serverless Framework installed (`npm i -g serverless`)
- Docker running (the runtime is deployed as a container)

## Project structure

```text
mcp-server/
├── index.js          # HTTP layer: node:http + toNodeHandler on port 8000
├── src/server.mjs    # the canonical MCP server (official MCP SDK v2)
├── client.mjs        # the family's shared test client
├── package.json      # Dependencies and start script
├── serverless.yml    # Serverless Framework configuration
└── README.md
```

## Deploy

```bash
npm install
sls deploy
```

## Test

The deploy output prints the runtime's MCP endpoint URL. The shared client calls it directly - the same way real MCP clients connect - signing requests with your local AWS credentials (SigV4, the runtime's default inbound auth):

```bash
AUTH=sigv4 SERVICE=bedrock-agentcore ENDPOINT=<agent URL from deploy output> node client.mjs
```

```
PASS  1. tools/list returns the canonical tools with cache hints — ttlMs=300000 cacheScope=public
PASS  2. add returns plain JSON with structured content — sum=42
PASS  3. slow_report streams incremental progress over SSE — 3 progress events, first at +810ms
PASS  4. approve_refund elicitation round-trip (accept and cancel) — input_required -> refunded o-1 / refund cancelled
...
```

Note the `requestHeaders.allowlist` block in `serverless.yml`: protocol revision `2026-07-28` requires the `Mcp-Method` and `Mcp-Name` headers on every request, and the allowlist forwards them to the container.

## Local development

```bash
npm install
sls dev
```

## How it works

The server is built with the official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) v2: `createMcpHandler` produces a web-standard handler serving the stateless MCP `2026-07-28` protocol revision (self-contained requests, `server/discover`, structured results) while answering older MCP clients through the SDK's built-in fallback on the same endpoint. `toNodeHandler` mounts it on a plain `node:http` server at `/mcp` on port 8000, the standard expected by AgentCore Runtime for MCP-protocol runtimes. The Runtime adds an `Mcp-Session-Id` header for its own session isolation; the stateless server accepts and ignores it.

The `serverless.yml` sets `protocol: MCP` on the agent, which tells AgentCore to route MCP traffic to the runtime. A commented `authorizer.jwt` block shows platform OAuth: the runtime validates Bearer JWTs from any OpenID Connect provider before requests reach the container - all configuration, no code.

**Related example:** [`mcp-server-lambda-tools`](../mcp-server-lambda-tools) inverts this trade — AWS runs the MCP server (AgentCore Gateway) and your code shrinks to plain Lambda functions with the tool schema declared in `serverless.yml`. Pick this example when you need full SDK-level control; pick that one for simple request/response tools with no MCP code at all.

## Connecting MCP clients

Once deployed, the runtime can be connected to any MCP client that supports remote MCP servers via Streamable HTTP. Refer to the [AgentCore MCP documentation](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-mcp.html) for invocation details and authentication setup.

<!--
title: 'Bedrock AgentCore: LangGraph Multi-Gateway Agents (JavaScript)'
description: LangGraph JS agents using separate public and private AgentCore Gateways with different authorization levels.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# LangGraph Multi-Gateway Example

A multi-agent setup with public and private gateways, each with different authorization levels.

## Features

- **Multiple Gateways**: Public (NONE) and Private (AWS_IAM) gateways
- **Two Agents**: Each agent connects to its own gateway
- **SigV4 Authentication**: Private agent uses AWS SigV4 for gateway access
- **Lambda Tools**: Calculator (public) and user lookup (private) as Lambda functions
- **Dockerfiles**: Each agent has its own Dockerfile for deployment

## Architecture

```text
                    +-----------------+
                    |   Calculator    |  (Lambda - nodejs20.x)
                    |   Function      |
                    +--------+--------+
                             |
                    +--------v--------+
   User Request --> | Public Gateway  |  (NONE auth)
   (calculator)     | (MCP protocol)  |
                    +--------+--------+
                             |
                    +--------v--------+
                    |  Public Agent   |  (Dockerfile.public)
                    | (LangGraph JS)  |
                    +-----------------+

                    +-----------------+
                    | Internal Lookup |  (Lambda - nodejs20.x)
                    |   Function      |
                    +--------+--------+
                             |
                    +--------v--------+
   User Request --> | Private Gateway |  (AWS_IAM auth)
   (user lookup)    | (MCP + SigV4)   |
                    +--------+--------+
                             |
                    +--------v--------+
                    | Private Agent   |  (Dockerfile.private)
                    | (LangGraph JS)  |
                    +-----------------+
```

## Quick Start

### Deploy

```bash
npm install
sls deploy
```

### Test

```bash
# Test both agents
PUBLIC_RUNTIME_ARN=<public-arn> PRIVATE_RUNTIME_ARN=<private-arn> node test-invoke.js

# Test individual agents
RUNTIME_ARN=<public-arn> AGENT_TYPE=public node test-invoke.js
RUNTIME_ARN=<private-arn> AGENT_TYPE=private node test-invoke.js
```

### Remove

```bash
sls remove
```

## Related Examples

- [langgraph-gateway](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-gateway) - Single gateway example
- [../python/langgraph-multi-gateway](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-multi-gateway) - Python version

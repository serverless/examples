<!--
title: Bedrock AgentCore: LangGraph Agent with Custom Browser (JavaScript)
description: LangGraph JS agent using a custom AgentCore Browser resource with session recording to S3.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# LangGraph Custom Browser Example

A LangGraph JavaScript agent using a custom AgentCore browser with session recording to S3.

## Features

- **Custom Browser**: Uses your own browser configuration instead of the AWS-managed default
- **Session Recording**: Browser sessions are recorded and uploaded to S3
- **Request Signing**: Reduces CAPTCHAs with signed browser requests
- **LangGraph JS**: ReAct agent with custom browser tool

## How It Differs from Default Browser

| Aspect     | Default Browser  | Custom Browser                        |
| ---------- | ---------------- | ------------------------------------- |
| Identifier | `aws.browser.v1` | Your own browser ID                   |
| Recording  | Not available    | S3 recording with configurable prefix |
| Signing    | Not configurable | Enabled for reduced CAPTCHAs          |
| Network    | Default          | Configurable (PUBLIC/VPC)             |

## Quick Start

### Deploy

```bash
npm install
sls deploy
```

### Test

```bash
RUNTIME_ARN=<your-runtime-arn> node test-invoke.js
```

### Remove

```bash
sls remove
```

## Related Examples

- [langgraph-browser](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-browser) - Default AWS-managed browser
- [strands-browser](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/strands-browser) - Browser with Strands Agents framework

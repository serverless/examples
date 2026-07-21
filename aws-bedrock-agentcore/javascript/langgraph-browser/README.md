<!--
title: 'Bedrock AgentCore: LangGraph Agent with Managed Browser (JavaScript)'
description: LangGraph JS agent using the AWS-managed AgentCore Browser tool for web navigation and screenshots.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# LangGraph Browser Example

A LangGraph JavaScript agent with AWS-managed browser capabilities deployed to Bedrock AgentCore.

## Features

- **Browser Automation**: Navigate, click, type, extract text, take screenshots
- **LangGraph JS**: ReAct agent pattern with browser tools
- **Claude Sonnet 5**: Powered by Amazon Bedrock
- **Minimal Configuration**: Just `ai: { agents: { browserAgent: {} } }` in `serverless.yml`

## Tools Available

| Tool               | Description                             |
| ------------------ | --------------------------------------- |
| `navigate`         | Navigate to a URL                       |
| `click`            | Click an element by CSS selector        |
| `type_text`        | Type text into an input element         |
| `get_text`         | Extract text from the page or element   |
| `get_html`         | Get HTML content of the page or element |
| `screenshot`       | Take a screenshot                       |
| `evaluate`         | Execute JavaScript in the page          |
| `wait_for_element` | Wait for an element to appear           |

## Quick Start

### Prerequisites

- Node.js 24+
- AWS credentials configured
- Serverless Framework CLI

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

- [langgraph-browser-custom](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/langgraph-browser-custom) - Custom browser with session recording
- [strands-browser](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/javascript/strands-browser) - Browser with Strands Agents framework

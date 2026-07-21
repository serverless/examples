<!--
title: 'Bedrock AgentCore: Strands Agent with Browser (Python)'
description: Strands Agents agent using AgentCore Browser for web automation and research tasks.
layout: Doc
framework: v4
platform: AWS
language: python
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Strands Browser Example

This example demonstrates using AgentCore Browser with the Strands Agents framework for web automation and research tasks.

## Features

- **AWS-managed browser** - No custom browser configuration needed
- **Strands integration** - Uses `strands_tools.browser.AgentCoreBrowser`
- **Streaming responses** - Real-time output via `agent.stream_async()`
- **Financial analysis** - Example use case for stock data extraction

## Project Structure

```text
strands-browser/
├── serverless.yml      # Serverless configuration
├── agent.py            # Strands agent with browser tool
├── pyproject.toml      # Python dependencies
├── Dockerfile          # Container configuration
├── test-invoke.py      # Test script
└── README.md           # This file
```

## Quick Start

### 1. Deploy

```bash
serverless deploy
```

### 2. Note the Runtime Endpoint URL

After deployment, note the runtime endpoint URL from the output (the ARN is embedded in the URL path):

```yaml
ai:
  agents:
    browserAgent: https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/xxx/invocations
```

### 3. Test

```bash
export RUNTIME_ARN="arn:aws:bedrock-agentcore:us-east-1:123456789012:runtime/xxx"
python test-invoke.py
```

## How It Works

### AWS-Managed Browser

This example uses the AWS-managed default browser. No `ai.browsers` configuration is needed in `serverless.yml`:

```yaml
ai:
  agents:
    browserAgent: {} # Auto-detects Dockerfile
```

### Strands Integration

The agent uses `AgentCoreBrowser` from `strands_tools.browser`:

```python
from strands_tools.browser import AgentCoreBrowser

# Initialize browser (uses AWS-managed infrastructure)
browser_tool = AgentCoreBrowser(region="us-east-1")

# Create agent with browser capability (default: global.anthropic.claude-sonnet-5, override via MODEL_ID)
agent = Agent(
    tools=[browser_tool.browser],
    model=MODEL_ID
)
```

### Example Prompts

**Web Search:**

```text
Search for the latest news about AWS and summarize the top 3 headlines
```

**Financial Analysis:**

```text
Analyze the Tesla stock page at https://www.marketwatch.com/investing/stock/tsla
and provide key financial metrics
```

**Data Extraction:**

```text
Visit https://aws.amazon.com/about-aws/whats-new/ and list the 5 most recent announcements
```

## Custom Browser Configuration

If you need session recording, VPC access, or request signing, define a custom browser:

```yaml
ai:
  browsers:
    customBrowser:
      network:
        mode: PUBLIC
      recording:
        enabled: true
        s3Location:
          bucket: my-recordings
          prefix: sessions/

  agents:
    browserAgent: {}
```

See the [Browser documentation](https://www.serverless.com/framework/docs/providers/aws/guide/agents/browser) for full configuration options.

## Cleanup

```bash
serverless remove
```

## Next Steps

- [Browser Documentation](https://www.serverless.com/framework/docs/providers/aws/guide/agents/browser) - Full configuration reference
- [Memory Example](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-memory) - Add conversation persistence
- [Gateway Example](https://github.com/serverless/examples/tree/v4/aws-bedrock-agentcore/python/langgraph-gateway) - Add custom Lambda tools

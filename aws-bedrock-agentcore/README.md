# AWS Bedrock AgentCore Examples

These examples deploy AI agents to [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) using the Serverless Framework, covering the Runtime, Gateway, Memory, Browser, and Code Interpreter capabilities. Examples are grouped by language — [`javascript`](javascript) and [`python`](python) — and most use [LangGraph](https://www.langchain.com/langgraph) or [Strands Agents](https://strandsagents.com/) as the agent framework.

## JavaScript

| Example | Description |
|:--- |:--- |
| [langgraph-basic](javascript/langgraph-basic) | Minimal LangGraph JS agent built automatically from source with no Dockerfile, deployed to AWS Bedrock AgentCore. |
| [langgraph-basic-dockerfile](javascript/langgraph-basic-dockerfile) | Minimal LangGraph JS agent deployed to AWS Bedrock AgentCore via a custom Dockerfile build. |
| [langgraph-browser](javascript/langgraph-browser) | LangGraph JS agent using the AWS-managed AgentCore Browser tool for web navigation and screenshots. |
| [langgraph-browser-custom](javascript/langgraph-browser-custom) | LangGraph JS agent using a custom AgentCore Browser resource with session recording to S3. |
| [langgraph-code-interpreter](javascript/langgraph-code-interpreter) | LangGraph JS agent using the AWS-managed AgentCore Code Interpreter for sandboxed code execution. |
| [langgraph-code-interpreter-custom](javascript/langgraph-code-interpreter-custom) | LangGraph JS agent using a custom AgentCore Code Interpreter with PUBLIC network access. |
| [langgraph-comprehensive](javascript/langgraph-comprehensive) | LangGraph JS agent combining Gateway tools, a direct MCP connection, browser, code interpreter, and memory in one deployment. |
| [langgraph-gateway](javascript/langgraph-gateway) | LangGraph JS agent exposing Lambda-backed tools through an AgentCore Gateway over MCP. |
| [langgraph-memory](javascript/langgraph-memory) | LangGraph JS agent using AgentCore Memory to persist and recall conversation history. |
| [langgraph-multi-gateway](javascript/langgraph-multi-gateway) | LangGraph JS agents using separate public and private AgentCore Gateways with different authorization levels. |
| [langgraph-streaming](javascript/langgraph-streaming) | LangGraph JS agent streaming LLM tokens in real time over SSE via BedrockAgentCoreApp. |
| [mcp-server](javascript/mcp-server) | Standalone JavaScript MCP server deployed to AWS Bedrock AgentCore Runtime, consumable by any MCP client. |
| [strands-browser](javascript/strands-browser) | Strands Agents JavaScript agent using AgentCore Browser tools for web automation. |

## Python

| Example | Description |
|:--- |:--- |
| [langgraph-basic-code](python/langgraph-basic-code) | Minimal LangGraph agent deployed to AWS Bedrock AgentCore using code (zip) deployment. |
| [langgraph-basic-docker](python/langgraph-basic-docker) | Minimal LangGraph agent deployed to AWS Bedrock AgentCore using Docker/container deployment. |
| [langgraph-browser](python/langgraph-browser) | LangGraph agent using AgentCore Browser via LangChain's browser toolkit for web automation. |
| [langgraph-browser-custom](python/langgraph-browser-custom) | LangGraph agent using a custom AgentCore Browser resource with session recording to S3. |
| [langgraph-code-interpreter](python/langgraph-code-interpreter) | LangGraph agent using the AWS-managed AgentCore Code Interpreter (SANDBOX mode) for Python execution. |
| [langgraph-code-interpreter-custom](python/langgraph-code-interpreter-custom) | LangGraph agent using a custom AgentCore Code Interpreter with PUBLIC network mode. |
| [langgraph-gateway](python/langgraph-gateway) | LangGraph agent exposing custom Lambda function tools via an auto-created AgentCore Gateway. |
| [langgraph-memory](python/langgraph-memory) | LangGraph agent using AgentCore Memory as a tool for recalling and saving conversation history. |
| [langgraph-multi-gateway](python/langgraph-multi-gateway) | LangGraph agent using multiple AgentCore Gateways with different authorization types and tool subsets. |
| [strands-browser](python/strands-browser) | Strands Agents agent using AgentCore Browser for web automation and research tasks. |

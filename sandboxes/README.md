# Sandboxes Examples

The `sandboxes` top-level property runs your code inside [AWS Lambda MicroVMs](https://www.serverless.com/framework/docs/providers/aws/guide/sandboxes) — real, isolated Linux VMs built from a container image, launched on demand and torn down after use. The examples below show the feature end to end, from the smallest possible configuration to a full production-style setup with lifecycle hooks, observability, and a self-hosted use case for running isolated agent sessions.

| Example | Description |
|:--- |:--- |
| [complete](complete) | Deploy-as-is showcase of every `sandboxes` property: Dockerfile build, memory, hooks, observability, IAM, and tags. |
| [minimal](minimal) | Smallest possible `sandboxes` configuration, using only the required `artifact` field and framework defaults. |
| [self-hosted-webhook](self-hosted-webhook) | Self-hosted AWS Lambda MicroVM sandbox per Claude Managed Agent session, launched on demand by a webhook. |

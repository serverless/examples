<!--
title: Serverless Framework Compose - Custom Event Bus Owner
description: The stateful service in the compose-eventbridge-custom-bus example that owns the EventBridge Custom Event Bus and outputs its ARN.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Custom Event Bus Owner (compose-eventbridge-custom-bus)

This directory contains the stateful, resource-only service that owns the
EventBridge Custom Event Bus (`AWS::EventsV2::EventBus`) used by the
[`compose-eventbridge-custom-bus`](../README.md) example. It outputs the bus ARN
as `OrdersBusArn`. Deploy it once per environment, and remove it after the
services that subscribe to the bus.

This service is not deployed on its own: it reads or provides values through
Serverless Compose. See the
[compose-eventbridge-custom-bus README](../README.md) for the full example
description and usage instructions.

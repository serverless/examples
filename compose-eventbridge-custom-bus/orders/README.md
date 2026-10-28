<!--
title: Serverless Framework Compose - Custom Event Bus Consumers
description: The consumers in the compose-eventbridge-custom-bus example, subscribed to an EventBridge Custom Event Bus with ordered single-event delivery and batched delivery with a dead-letter queue.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Custom Event Bus Consumers (compose-eventbridge-custom-bus)

This directory contains the two consumers of the
[`compose-eventbridge-custom-bus`](../README.md) example. Each `eventBridge`
event subscribes a function to the Custom Event Bus: `fulfil` receives one
event at a time, in order within each event group, and `audit` receives arrays
of events and has a dead-letter queue.

This service is not deployed on its own: it reads or provides values through
Serverless Compose. See the
[compose-eventbridge-custom-bus README](../README.md) for the full example
description and usage instructions.

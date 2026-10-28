<!--
title: Serverless Framework Compose - Custom Event Bus Producer
description: The producer in the compose-eventbridge-custom-bus example, which publishes order events to an EventBridge Custom Event Bus with the AWS SDK for JavaScript v3.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Custom Event Bus Producer (compose-eventbridge-custom-bus)

This directory contains the function that publishes order events to the
Custom Event Bus in the [`compose-eventbridge-custom-bus`](../README.md)
example, with `@aws-sdk/client-eventbridgev2`. Install its dependencies with
`npm install` before you deploy.

This service is not deployed on its own: it reads or provides values through
Serverless Compose. See the
[compose-eventbridge-custom-bus README](../README.md) for the full example
description and usage instructions.

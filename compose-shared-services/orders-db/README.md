<!--
title: Serverless Framework Compose - Shared Orders Database
description: The shared, stateful DynamoDB service in the compose-shared-services example, deployed once and read from personal stages via the service resolver.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Orders Database (compose-shared-services)

This directory contains the shared, stateful DynamoDB service used by the
[`compose-shared-services`](../README.md) example. It is deployed once to a
long-lived data stage and read from personal stages via the `service` resolver.

This service is not deployed on its own. See the
[compose-shared-services README](../README.md) for the full example description
and usage instructions.

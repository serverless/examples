<!--
title: Serverless Framework Compose - Orders API
description: The HTTP API in the compose-shared-services example, consuming both a same-stage worker output and a cross-stage shared-database output via the service resolver.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Orders API (compose-shared-services)

This directory contains the HTTP API used by the
[`compose-shared-services`](../README.md) example. It writes orders to the shared
DynamoDB table (read cross-stage via the `service` resolver) and enqueues jobs on
the same-stage worker queue.

This service is not deployed on its own. See the
[compose-shared-services README](../README.md) for the full example description
and usage instructions.

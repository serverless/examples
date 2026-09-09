<!--
title: Serverless Framework Compose - Job Worker
description: The SQS queue and worker Lambda in the compose-shared-services example, deployed per stage and referenced same-stage via the service resolver.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Job Worker (compose-shared-services)

This directory contains the SQS queue and the worker Lambda that drains it, used
by the [`compose-shared-services`](../README.md) example. It is deployed per
stage and referenced same-stage from `api` via the `service` resolver.

This service is not deployed on its own. See the
[compose-shared-services README](../README.md) for the full example description
and usage instructions.

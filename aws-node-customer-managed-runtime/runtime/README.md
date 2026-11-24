<!--
title: 'Customer-managed Lambda runtime - Runtime service'
description: 'The runtime publisher in the aws-node-customer-managed-runtime example, deployed by Serverless Compose.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Runtime service

This directory holds the service that publishes the customer-managed runtime in the [`aws-node-customer-managed-runtime`](https://github.com/serverless/examples/tree/v4/aws-node-customer-managed-runtime) example: the runtime `platform-node24-<stage>`, its version `v1` from the image in `Dockerfile`, and the alias `stable`. Its `RuntimeAliasArn` output goes to the `app` service.

It is not deployed on its own. Deploy the whole example from its root directory as its [README](https://github.com/serverless/examples/blob/v4/aws-node-customer-managed-runtime/README.md) describes.

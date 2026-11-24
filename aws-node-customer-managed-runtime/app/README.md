<!--
title: 'Customer-managed Lambda runtime - App service'
description: 'The function that runs on the customer-managed runtime in the aws-node-customer-managed-runtime example, deployed by Serverless Compose.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# App service

This directory holds the service whose function runs on the customer-managed runtime in the [`aws-node-customer-managed-runtime`](https://github.com/serverless/examples/tree/v4/aws-node-customer-managed-runtime) example. Its `provider.runtime` is the runtime alias ARN that Serverless Compose passes in from the `runtime` service.

It is not deployed on its own. Deploy the whole example from its root directory as its [README](https://github.com/serverless/examples/blob/v4/aws-node-customer-managed-runtime/README.md) describes.

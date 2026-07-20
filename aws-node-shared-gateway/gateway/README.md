<!--
title: 'Shared Gateway — gateway service'
description: 'The shared AWS API Gateway REST API that the products, transactions and users services attach their routes to via CloudFormation exports.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/allanchua101'
authorName: 'Allan Chua'
authorAvatar: 'https://avatars3.githubusercontent.com/u/26626798?s=460&v=4'
-->

# Shared Gateway — gateway service

This is one of four sub-services that make up the [`aws-node-shared-gateway`](../README.md) example. It deploys the shared `AWS::ApiGateway::RestApi` resource and exports its REST API ID and root resource ID so the sibling `products`, `transactions` and `users` services can attach their own routes to the same API Gateway.

See the [parent README](../README.md) for the full example description and deployment order.

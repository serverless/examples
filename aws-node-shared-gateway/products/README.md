<!--
title: 'Shared Gateway — products service'
description: 'An eshop-products Lambda service that attaches its /products/list route to the shared API Gateway REST API deployed by the gateway service.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/allanchua101'
authorName: 'Allan Chua'
authorAvatar: 'https://avatars3.githubusercontent.com/u/26626798?s=460&v=4'
-->

# Shared Gateway — products service

This is one of four sub-services that make up the [`aws-node-shared-gateway`](../README.md) example. It imports the shared REST API ID and root resource ID exported by the `gateway` service and attaches a `GET /products/list` route to it.

See the [parent README](../README.md) for the full example description and deployment order.

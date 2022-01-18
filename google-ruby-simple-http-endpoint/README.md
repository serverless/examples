<!--
title: 'GCF Simple HTTP Endpoint example in Ruby'
description: This example demonstrates how to setup a simple Ruby HTTP GET endpoint on GCP Cloud Functions.
layout: Doc
framework: v1
platform: 'Google Cloud'
language: Ruby
priority: 10
authorLink: 'https://github.com/colemanja91'
authorName: 'Allie Coleman'
authorAvatar: 'https://avatars.githubusercontent.com/u/2940547?v=4s=140'
-->

# Simple HTTP Endpoint Example

This example demonstrates how to setup a simple Ruby HTTP GET endpoint.

## Use Cases

- Wrapping an existing internal or external endpoint/service

## Development

The GCF Ruby environment has the following requirements:
- The code to be invoked must be defined in the `app.rb` file using `FunctionsFramework`
- Any dependencies must be specified in the `Gemfile`

https://cloud.google.com/functions/docs/concepts/ruby-runtime
https://github.com/GoogleCloudPlatform/functions-framework-ruby

## Deploy

Run the following to deploy:

```bash
serverless deploy
```

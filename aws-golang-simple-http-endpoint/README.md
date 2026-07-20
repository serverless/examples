<!--
title: 'AWS Simple HTTP Endpoint example in Golang'
description: This example demonstrates how to setup a simple HTTP endpoint in Go.
layout: Doc
framework: v4
platform: AWS
language: Go
priority: 10
authorLink: 'https://github.com/sebito91'
authorName: 'Sebastian Borza'
authorAvatar: 'https://avatars0.githubusercontent.com/u/3159454?v=4&s=140'
-->

# Serverless-golang simple HTTP endpoint example

Two independent HTTP GET endpoints (`/hello` and `/world`) implemented as separate Go Lambda
functions.

## Build & Deploy

Requires Go 1.25+. Functions are compiled to `provided.al2023` (arm64) custom-runtime bootstraps.

```bash
make build
serverless deploy
```

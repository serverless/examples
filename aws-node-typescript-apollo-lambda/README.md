<!--
title: 'AWS Apollo Lambda (NodeJS & Typescript)'
description: 'This example provides a setup for a Lambda Graphql API with apollo'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/jmpfrazao'
authorName: 'Miguel Frazao'
authorAvatar: 'https://avatars3.githubusercontent.com/u/28927258?s=460&v=4'
-->
# Apollo Lambda GraphQL API Example

> Note: `graphql` is held at `^16.14.2` (not the current `17.x` major) because `@apollo/server`'s
> latest release (`5.5.1`) still declares a `peerDependencies` constraint of `graphql: ^16.11.0`.
> Bump this once `@apollo/server` adds `graphql` 17 support.

> Note: TypeScript is intentionally held at `5.x` — the TypeScript 7 native compiler isn't yet
> supported by the surrounding ecosystem tooling (checked 2026-07-20).

This example demonstrates how to setup a lambda graphql API with apollo

- I used apiKeys to secure the endpoints but you can add custom authorizers

## Use Cases
- Small graphql API
- Creating a temporary lambda API that can easily be converted to standard GraphQL API

## Setup
- Optionally set the following environment variables before deploying:
  - `APOLLO_LAMBDA_KEY` - value for the `x-api-key` header (defaults to `your-api-key-that-is-at-least-characters-long` if unset)
  - `NODE_ENV` - set to `production` to disable GraphQL introspection

- sls deploy

## Usage
- To test it locally with serverless-offline by running: 
  `npm run dev`
- set `x-api-key` header with key `your-api-key-that-is-at-least-characters-long`

## Future
- Add support for subscription with Redis

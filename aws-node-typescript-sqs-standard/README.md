<!--
title: 'AWS SQS Standard Example (NodeJS & Typescript)'
description: 'This example demonstrates how to setup a SQS with Typescript.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/jmpfrazao'
authorName: 'Miguel Frazao'
authorAvatar: 'https://avatars3.githubusercontent.com/u/28927258?s=460&v=4'
-->
# Simple SQS Standard Example

> Note: TypeScript is intentionally held at `5.x` — the TypeScript 7 native compiler isn't yet
> supported by the surrounding ecosystem tooling (checked 2026-07-20).

This example demonstrates how to setup a SQS Standard and send messages through the message body and attributes.

## Use Cases
- Decouple message producers from message consumers.
- This is one way to architect for scale and reliability.

## Setup
- sls deploy

## Usage
- To print out the logs of the receiver sqs handler on the terminal
  `sls logs -f receiver -t`

- send a HTTP POST request to the sender lambda with a JSON payload

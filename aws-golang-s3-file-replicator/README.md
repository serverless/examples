<!--
title: .'AWS S3 Bucket Replicator in Golang'
description: 'Boilerplate code for Golang with S3 object create event and replicator example'
framework: v1
platform: AWS
language: Go
priority: 10
authorLink: 'https://github.com/p0n2'
authorName: 'p0n2'
authorAvatar: 'https://avatars3.githubusercontent.com/u/59630164'
-->

# Serverless-golang AWS S3 object create event and replicator example

Serverless boilerplate code for golang with S3 object create event and replicator example

The example shows following steps:

1. Detect object create event with input bucket
2. Copy detected object and duplicate object to new bucket with assigned object name.
3. [optional] you will able to append file extension or rename object name with assign object name.

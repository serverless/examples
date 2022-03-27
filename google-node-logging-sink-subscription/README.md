<!--
title: 'GCF Logging Sink Subscription'
description: This example demonstrates how to trigger a cloud function when a specific event occurs in Google Cloud project.
layout: Doc
framework: v1
platform: 'Google Cloud'
language: nodeJS
priority: 10
authorLink: 'https://github.com/gnokoheat'
authorName: 'GNOKOHEAT'
authorAvatar: 'https://avatars0.githubusercontent.com/u/38800095?v=4&s=140'
-->

# Logging Sink Subscription Example

This example demonstrates how to trigger a cloud function when a specific event occurs in Google Cloud project.

## Use Cases

- When a storage bucket is created, the cloud function is called. Event details are left in the cloud function log.
  - `protoPayload.methodName:("storage.buckets.create")`
- You can change the filter to receive the desired events.
  - `severity="ERROR"`, Filtering error events.
  - `protoPayload.methodName:("compute.instances.insert" OR "beta.compute.instances.insert")`, Filtering instance creation events

## Setup

You should add permission `Logging` to IAM of `cloudservices.gserviceaccount.com` before deployment. This is required to create a logging sink in the deployment manager.

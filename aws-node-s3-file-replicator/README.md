<!--
title: 'AWS S3 File Replicator'
description: 'This example creates 2 AWS S3 buckets and copies files in one bucket to the other'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/ac360'
authorName: 'Austen Collins'
authorAvatar: 'https://avatars3.githubusercontent.com/u/2752551?v=4&s=140'
-->
# AWS S3 File Replicator

This example creates 2 AWS S3 buckets and copies files in one bucket to the other.  It's written in Node.js

Unless you use the existing S3 bucket plugin, CloudFormation won't let you use an existing AWS S3 bucket.

In Serverless Framework, when you have `function` `s3` `events`, they will automatically create a new AWS S3 bucket, if it doesn't exist already.  This is where the inputs bucket comes from.  The outputs bucket is created in the `resources` section.

Simply upload a file to the inputs bucket (e.g. using the AWS S3 console) and see it be instantly transferred to the outputs bucket.  

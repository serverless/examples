<!--
title: 'AWS DynamoDB Streams Processing example in NodeJS'
description: This example shows you how to consume a DynamoDB Stream, transform records, and archive them to S3.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/kaihendry'
authorName: 'Kai Hendry'
authorAvatar: 'https://avatars3.githubusercontent.com/u/765871?v=4&s=140'
-->
# DynamoDB Streams processing to AWS S3

A Lambda function triggered by a **DynamoDB Stream** that reads each changed
record, unmarshalls it from DynamoDB's attribute-value shape, and writes it as
JSON to S3 — a pattern you can adapt for change-data-capture, fan-out to
other systems, or building a materialized view from table changes.

NOTE: DynamoDB triggers need to be manually associated / setup with the lambda function.

* https://ap-southeast-1.console.aws.amazon.com/dynamodb/home?region=ap-southeast-1#tables:selected=staging_EXAMPLE
* https://ap-southeast-1.console.aws.amazon.com/dynamodb/home?region=ap-southeast-1#tables:selected=production_EXAMPLE

Upon deletion the image.json becomes an empty file, since REMOVE events carry
no `NewImage`.

For pure backup needs, this is not the right tool: DynamoDB's built-in
[point-in-time recovery](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/PointInTimeRecovery.html)
and [native table export to S3](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/S3DataExport.HowItWorks.html)
already cover that use case without any custom code.

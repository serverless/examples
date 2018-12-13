<!--
title: TODO
description: This examples shows your how to create a backup of your DynamoDB table to S3.
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/kaihendry'
authorName: 'Kai Hendry'
authorAvatar: 'https://avatars3.githubusercontent.com/u/765871?v=4&s=140'
-->
# DynamoDB stream events to AWS S3

Which effectively creates a **backup of your dynamoDB table** assuming an event
was caught for every record. Hint: [Introduce a new field
"backedup"](https://s.natalian.org/2022/rupdated.js) to effectively
trigger a backup.

NOTE: DynamoDB triggers need to be manually associated / setup with the lambda function.

* https://ap-southeast-1.console.aws.amazon.com/dynamodb/home?region=ap-southeast-1#tables:selected=staging_EXAMPLE
* https://ap-southeast-1.console.aws.amazon.com/dynamodb/home?region=ap-southeast-1#tables:selected=production_EXAMPLE

Upon deletion the image.json becomes an empty file.

# DynamoDB stream events to AWS S3

Which effectively creates a **backup of your dynamoDB table** assuming an event
was caught for every record. Hint: [Introduce a new field
"backedup"](https://s.natalian.org/2017-06-22/rupdated.js) to effectively
trigger a backup.

NOTE: DynamoDB triggers need to be manually associated / setup with the lambda function.

* https://ap-southeast-1.console.aws.amazon.com/dynamodb/home?region=ap-southeast-1#tables:selected=staging_EXAMPLE
* https://ap-southeast-1.console.aws.amazon.com/dynamodb/home?region=ap-southeast-1#tables:selected=production_EXAMPLE

Upon deletion the image.json becomes an empty file.

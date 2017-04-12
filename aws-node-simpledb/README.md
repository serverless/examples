# Serverless REST API with Simpledb

[SimpleDB](https://aws.amazon.com/simpledb/) is an AWS NoSQL key-value storage service without a web console.

SimpleDB consists of domains (tables) and items (rows). Each domain can be up too 10GB, each item can have up to 256 attributes (columns), each up to 1024 bytes big. So each item can store 262.144 kilobytes of data. [Details](http://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/SDBLimits.html).

As you see it's mainly for storing tiny pieces of data. A use case could include: storing pointers to S3 objects, querying SimpleDB is significantly faster than sorting through S3.

It's also basically free, with 1 GB of data transfer out and 1 GB of storage costing less than a nickel a month. [Details](https://aws.amazon.com/simpledb/pricing/).

The examples in `codes/` includes:

- domain.js
  - createdomain
  - deletedomain

- item.js
  - createitem
  - updateitem
  - deleteitem
  - select

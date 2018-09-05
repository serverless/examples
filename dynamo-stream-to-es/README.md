# Dynamo Stream To ES
## Disclaimer, deploying cloud information costs $$, elasticsearch is not part of the free tier as such, deploy with caution.

This serverless project acts as an example for:
* Creating a Dynamo DB Table via Cloudformation
* Creating a 1 node Elasticserach Cluster via Cloudformation
* Creating a generic Go function which maps the keyspace from Dynamo DB to ElasticSearch

to deploy the example you must first have npm installed on your system [https://nodejs.org/en/download/](https://nodejs.org/en/download/)

cd into `sls-go-examples/dynamo-stream-to-es`

run npm install which will install the serverless CLI. Once you have serverless on your machine you may run `./node_modules/serverless/bin/serverless deploy` This will deploy the serverless project to your AWS Account. This example will very likely take ~15min to deploy (because of elasticsearch).

In production the deployment of data stores (dynamodb, rds variants, elasticsearch) should probably not be tied to an application deployment.


## To build for AWS Lambda (linux binaries) and deploy:

`$ make`

This project depends on the `dep` tool, if you don't have it you may install it [here](https://github.com/golang/dep)

`$ npm install`

`$ make`

`$ node_modules/serverless/bin/serverless deploy`

## Seeding Your Dynamo Table with Data

make sure `cmd/seed-dynamo/main.go` refers to the table you've created, then run

`$ go run cmd/seed-dynamo/main.go`

Once data is written to Dynamo, your lambda function will trigger off of the Dynamo Stream events, and data should begin flowing into elastic search.

You should be able to create a Kibana index by navigating to your Kibana endpoint (found in the AWS Console) and clicking on the management tab. You should see something like this:

![kibana](docs/kibana.png)

Follow the instructiosn to create the index, and you should now be able to query your data like so:

![query](docs/query.png)

If you have any questions/issues/improvements, please open up a PR or leave an Issue, I'd be more than happy to help!
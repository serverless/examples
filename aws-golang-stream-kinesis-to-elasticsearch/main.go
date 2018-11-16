package main

import (
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	elastic "github.com/serverless/examples/aws-golang-stream-kinesis-to-elasticsearch/elastic"
)

const host = "http://es.signalmalt.com"

func handler(ctx context.Context, event events.KinesisEvent) error {
	client, err := elastic.NewClient(host)
	if err != nil {
		return err
	}

	return client.PushRecords(event.Records)
}

func main() {
	lambda.Start(handler)
}

package main

import (
	"context"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	elastic "github.com/serverless/examples/aws-golang-stream-kinesis-to-elasticsearch/elastic"
)

func handler(ctx context.Context, event events.KinesisEvent) error {
	client, err := elastic.NewClient(os.Getenv("ELASTICSEARCH_HOST"), os.Getenv("ELASTICSEARCH_SCHEMA"))
	if err != nil {
		return err
	}

	return client.PushRecords(event.Records)
}

func main() {
	lambda.Start(handler)
}

package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/olivere/elastic"
	"github.com/serverless/examples/aws-golang-dynamo-stream-to-elasticsearch/dstream"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
)

var awsSession = session.Must(session.NewSession(&aws.Config{}))
var dynamoSvc = dynamodb.New(awsSession)
var esclient = new(dstream.Elasticsearch)

func handler(e events.DynamoDBEvent) error {
	var item map[string]events.DynamoDBAttributeValue
	fmt.Println("Beginning ES Sync")
	for _, v := range e.Records {
		switch v.EventName {
		case "INSERT":
			fallthrough
		case "MODIFY":
			tableName := strings.Split(v.EventSourceArn, "/")[1]
			item = v.Change.NewImage
			details, err := (&dstream.DynamoDetails{
				DynamoDBAPI: dynamoSvc,
			}).Get(tableName)
			if err != nil {
				return err
			}

			svc, err := elastic.NewClient(
				elastic.SetSniff(false),
				elastic.SetURL(fmt.Sprintf("https://%s", os.Getenv("ELASTICSEARCH_URL"))),
			)
			if err != nil {
				return err
			}
			esclient.Client = svc
			resp, err := esclient.Update(details, item)
			if err != nil {
				return err
			}
			fmt.Println(resp.Result)
		default:
		}
	}
	return nil
}

func main() {
	lambda.Start(handler)
}

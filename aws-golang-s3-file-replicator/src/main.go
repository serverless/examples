package main

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"

	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

func Handler(ctx context.Context, S3Event events.S3Event) {

	svc := s3.New(session.New())
	input := &s3.CopyObjectInput{
		CopySource: aws.String("/" + S3Event.Records[0].S3.Bucket.Name + "/" + S3Event.Records[0].S3.Object.Key),
		Bucket:     aws.String(os.Getenv("OUTPUT_BUCKET")),       // target bucket
		Key:        aws.String(S3Event.Records[0].S3.Object.Key), // target object name
	}

	_, err := svc.CopyObject(input)
	if err != nil {
		// For information on other S3 API error codes see:
		// http://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case s3.ErrCodeObjectNotInActiveTierError:
				fmt.Println(s3.ErrCodeObjectNotInActiveTierError, aerr.Error())
			default:
				// Process error generically
				fmt.Println("Error:", aerr.Error())
			}
		} else {
			// Process error generically
			fmt.Println("Error:", err.Error())
		}
	}
}

func main() {
	lambda.Start(Handler)
}

package main

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"
)

func Handler(ctx context.Context, S3Event events.S3Event) {

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		fmt.Println("Error loading AWS config:", err.Error())
		return
	}
	svc := s3.NewFromConfig(cfg)

	input := &s3.CopyObjectInput{
		CopySource: aws.String("/" + S3Event.Records[0].S3.Bucket.Name + "/" + S3Event.Records[0].S3.Object.Key),
		Bucket:     aws.String(os.Getenv("OUTPUT_BUCKET")),       // target bucket
		Key:        aws.String(S3Event.Records[0].S3.Object.Key), // target object name
	}

	_, err = svc.CopyObject(ctx, input)
	if err != nil {
		// For information on other S3 API error codes see:
		// http://docs.aws.amazon.com/AmazonS3/latest/API/ErrorResponses.html
		var notInActiveTier *types.ObjectNotInActiveTierError
		var apiErr smithy.APIError
		switch {
		case errors.As(err, &notInActiveTier):
			fmt.Println("ObjectNotInActiveTierError", err.Error())
		case errors.As(err, &apiErr):
			fmt.Println("Error:", apiErr.ErrorMessage())
		default:
			// Process error generically
			fmt.Println("Error:", err.Error())
		}
	}
}

func main() {
	lambda.Start(Handler)
}

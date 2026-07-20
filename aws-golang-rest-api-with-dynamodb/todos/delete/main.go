package main

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type Item struct {
	Id      string `json:"id,omitempty" dynamodbav:"id,omitempty"`
	Title   string `json:"title" dynamodbav:"title"`
	Details string `json:"details" dynamodbav:"details"`
}

func Handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	// Load default config and create DynamoDB client
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		fmt.Println("Error loading AWS config: ", err.Error())
		return events.APIGatewayProxyResponse{StatusCode: 500}, nil
	}
	svc := dynamodb.NewFromConfig(cfg)

	pathParamId := request.PathParameters["id"]

	input := &dynamodb.DeleteItemInput{
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: pathParamId},
		},
		TableName: aws.String(os.Getenv("DYNAMODB_TABLE")),
	}

	// DeleteItem request
	_, err = svc.DeleteItem(ctx, input)

	// Checking for errors, return error
	if err != nil {
		fmt.Println("Got error calling DeleteItem: ", err.Error())
		return events.APIGatewayProxyResponse{StatusCode: 500}, nil
	}

	return events.APIGatewayProxyResponse{StatusCode: 204}, nil
}

func main() {
	lambda.Start(Handler)
}

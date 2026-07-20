package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
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

	// Getting id from path parameters
	pathParamId := request.PathParameters["id"]

	fmt.Println("Derived pathParamId from path params: ", pathParamId)

	// GetItem request
	result, err := svc.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(os.Getenv("DYNAMODB_TABLE")),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: pathParamId},
		},
	})

	// Checking for errors, return error
	if err != nil {
		fmt.Println(err.Error())
		return events.APIGatewayProxyResponse{StatusCode: 500}, nil
	}

	// Checking type
	if len(result.Item) == 0 {
		return events.APIGatewayProxyResponse{StatusCode: 404}, nil
	}

	// Created item of type Item
	item := Item{}

	// result is of type *dynamodb.GetItemOutput
	// result.Item is of type map[string]types.AttributeValue
	// UnmarshalMap result.Item into item
	err = attributevalue.UnmarshalMap(result.Item, &item)

	if err != nil {
		panic(fmt.Sprintf("Failed to UnmarshalMap result.Item: %s", err))
	}

	// Marshal to type []uint8
	marshalledItem, err := json.Marshal(item)

	// Return marshalled item
	return events.APIGatewayProxyResponse{Body: string(marshalledItem), StatusCode: 200}, nil
}

func main() {
	lambda.Start(Handler)
}

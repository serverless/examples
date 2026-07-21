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
	"github.com/google/uuid"
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

	// New uuid for item id
	itemUuid := uuid.New().String()

	fmt.Println("Generated new item uuid:", itemUuid)

	// Unmarshal to Item to access object properties
	itemString := request.Body
	itemStruct := Item{}
	json.Unmarshal([]byte(itemString), &itemStruct)

	if itemStruct.Title == "" {
		return events.APIGatewayProxyResponse{StatusCode: 400}, nil
	}

	// Create new item of type item
	item := Item{
		Id:      itemUuid,
		Title:   itemStruct.Title,
		Details: itemStruct.Details,
	}

	// Marshal to dynamodb item
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		fmt.Println("Error marshalling item: ", err.Error())
		return events.APIGatewayProxyResponse{StatusCode: 500}, nil
	}

	tableName := os.Getenv("DYNAMODB_TABLE")

	// Build put item input
	fmt.Println("Putting item: ", av)
	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String(tableName),
	}

	// PutItem request
	_, err = svc.PutItem(ctx, input)

	// Checking for errors, return error
	if err != nil {
		fmt.Println("Got error calling PutItem: ", err.Error())
		return events.APIGatewayProxyResponse{StatusCode: 500}, nil
	}

	// Marshal item to return
	itemMarshalled, err := json.Marshal(item)

	fmt.Println("Returning item: ", string(itemMarshalled))

	//Returning response with AWS Lambda Proxy Response
	return events.APIGatewayProxyResponse{Body: string(itemMarshalled), StatusCode: 200}, nil
}

func main() {
	lambda.Start(Handler)
}

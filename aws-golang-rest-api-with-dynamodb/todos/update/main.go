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

	itemString := request.Body
	itemStruct := Item{}
	json.Unmarshal([]byte(itemString), &itemStruct)

	info := Item{
		Title:   itemStruct.Title,
		Details: itemStruct.Details,
	}

	fmt.Println("Updating title to: ", info.Title)
	fmt.Println("Updating details to: ", info.Details)

	// Prepare input for Update Item
	input := &dynamodb.UpdateItemInput{
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":t": &types.AttributeValueMemberS{Value: info.Title},
			":d": &types.AttributeValueMemberS{Value: info.Details},
		},
		TableName: aws.String(os.Getenv("DYNAMODB_TABLE")),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: pathParamId},
		},
		ReturnValues:     types.ReturnValueUpdatedNew,
		UpdateExpression: aws.String("set title = :t, details = :d"),
	}

	// UpdateItem request
	_, err = svc.UpdateItem(ctx, input)

	// Checking for errors, return error
	if err != nil {
		fmt.Println(err.Error())
		return events.APIGatewayProxyResponse{StatusCode: 500}, nil
	}

	return events.APIGatewayProxyResponse{StatusCode: 204}, nil
}

func main() {
	lambda.Start(Handler)
}

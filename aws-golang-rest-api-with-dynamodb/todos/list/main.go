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

	// Build the query input parameters
	params := &dynamodb.ScanInput{
		TableName: aws.String(os.Getenv("DYNAMODB_TABLE")),
	}

	// Scan table
	result, err := svc.Scan(ctx, params)

	// Checking for errors, return error
	if err != nil {
		fmt.Println("Query API call failed: ", err.Error())
		return events.APIGatewayProxyResponse{StatusCode: 500}, nil
	}

	var itemArray []Item

	for _, i := range result.Items {
		item := Item{}

		// result is of type *dynamodb.ScanOutput
		// each entry in result.Items is of type map[string]types.AttributeValue
		// UnmarshalMap each entry into item
		err = attributevalue.UnmarshalMap(i, &item)

		if err != nil {
			fmt.Println("Got error unmarshalling: ", err.Error())
			return events.APIGatewayProxyResponse{StatusCode: 500}, nil
		}

		itemArray = append(itemArray, item)
	}

	fmt.Println("itemArray: ", itemArray)

	itemArrayString, err := json.Marshal(itemArray)
	if err != nil {
		fmt.Println("Got error marshalling result: ", err.Error())
		return events.APIGatewayProxyResponse{StatusCode: 500}, nil
	}

	return events.APIGatewayProxyResponse{Body: string(itemArrayString), StatusCode: 200}, nil
}

func main() {
	lambda.Start(Handler)
}

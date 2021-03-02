package main

import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"

	"encoding/json"
	"fmt"
	"os"
)

type Item struct {
	Id      string `json:"id,omitempty"`
	Title   string `json:"title"`
	Details string `json:"details"`
}

func Handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	// Creating session for client
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))

	// Create DynamoDB client
	svc := dynamodb.New(sess)

	// Getting id from path parameters
	pathParamId := request.PathParameters["id"]

	fmt.Println("Derived pathParamId from path params: ", pathParamId)

	// GetItem request
	result, err := svc.GetItem(&dynamodb.GetItemInput{
		TableName: aws.String(os.Getenv("DYNAMODB_TABLE")),
		Key: map[string]*dynamodb.AttributeValue{
			"id": {
				S: aws.String(pathParamId),
			},
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
	// result.Item is of type map[string]*dynamodb.AttributeValue
	// UnmarshallMap result.item into item
	err = dynamodbattribute.UnmarshalMap(result.Item, &item)

	if err != nil {
		panic(fmt.Sprintf("Failed to UnmarshalMap result.Item: ", err))
	}

	// Marshal to type []uint8
	marshalledItem, err := json.Marshal(item)

	// Return marshalled item
	return events.APIGatewayProxyResponse{Body: string(marshalledItem), StatusCode: 200}, nil
}

func main() {
	lambda.Start(Handler)
}

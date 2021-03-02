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

	// Build the query input parameters
	params := &dynamodb.ScanInput{
		TableName: aws.String(os.Getenv("DYNAMODB_TABLE")),
	}

	// Scan table
	result, err := svc.Scan(params)

	// Checking for errors, return error
	if err != nil {
		fmt.Println("Query API call failed: ", err.Error())
		return events.APIGatewayProxyResponse{StatusCode: 500}, nil
	}

	var itemArray []Item

	for _, i := range result.Items {
		item := Item{}

		// result is of type *dynamodb.GetItemOutput
		// result.Item is of type map[string]*dynamodb.AttributeValue
		// UnmarshallMap result.item to item
		err = dynamodbattribute.UnmarshalMap(i, &item)

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

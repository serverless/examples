package main

import (
	"context"
	"encoding/json"
	"gomapservice/geomap"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

// Response is of type APIGatewayProxyResponse since we're leveraging the
// AWS Lambda Proxy Request functionality (default behavior)
//
// https://serverless.com/framework/docs/providers/aws/events/apigateway/#lambda-proxy-integration
type Response events.APIGatewayProxyResponse

// Handler is our lambda handler invoked by the `lambda.Start` function call
// Handler function Using AWS Lambda Proxy Request
func Handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	ctx := context.Background()

	//required query
	address := request.QueryStringParameters["address"]

	//Replace with api key
	key := os.Getenv("GOOGLE_API_KEY")

	geoParams := map[string]string{
		"address": address,
		"key":     key,
	}

	//obtains find place response to be processed
	googleResp, err := geomap.FindPlace(ctx, geoParams)
	if err != nil {
		return events.APIGatewayProxyResponse{Body: "Error", StatusCode: 400}, err
	}

	jsonString, _ := json.Marshal(googleResp)

	//Returning response with AWS Lambda Proxy Response
	return events.APIGatewayProxyResponse{Body: string(jsonString), StatusCode: 200}, nil
}

func main() {
	lambda.Start(Handler)
}

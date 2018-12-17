package main

import (
	"fmt"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var name string
	if _, ok := request.RequestContext.Authorizer["name"]; ok {
		name = request.RequestContext.Authorizer["name"].(string)
	} else {
		return events.APIGatewayProxyResponse{
			Body:       "Unauthorized: Must be an authorized user with a name",
			StatusCode: http.StatusUnauthorized,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		Body:       fmt.Sprintf("Hello, %s!", name),
		StatusCode: http.StatusOK,
	}, nil
}

func main() {
	lambda.Start(handler)
}

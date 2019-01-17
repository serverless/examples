package main

import (
	"net/http"

	"github.com/aws/aws-lambda-go/events"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("Hello world", func() {
	var (
		response events.APIGatewayProxyResponse
		request  events.APIGatewayProxyRequest
		err      error
	)

	JustBeforeEach(func() {
		response, err = handler(request)
		Expect(err).To(BeNil())
	})

	AfterEach(func() {
		request.RequestContext = events.APIGatewayProxyRequestContext{}
	})

	Context("When the user is not authorized with a name", func() {
		It(`Returns unauthorized`, func() {
			Expect(response.Body).To(Equal("Unauthorized: Must be an authorized user with a name"))
			Expect(response.StatusCode).To(Equal(http.StatusUnauthorized))
		})
	})

	Context("When the user is authorized with a name", func() {
		BeforeEach(func() {
			request.RequestContext.Authorizer = map[string]interface{}{
				"name": "Bob",
			}
		})

		It(`Returns "Hello, World!" and an OK status`, func() {
			Expect(response.Body).To(Equal("Hello, Bob!"))
			Expect(response.StatusCode).To(Equal(http.StatusOK))
		})
	})
})

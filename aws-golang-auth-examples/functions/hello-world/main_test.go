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

	It(`Returns "Hello, World!" and an OK status`, func() {
		Expect(response.Body).To(Equal("Hello, World!"))
		Expect(response.StatusCode).To(Equal(http.StatusOK))
	})
})

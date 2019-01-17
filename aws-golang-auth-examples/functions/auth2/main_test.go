package main

import (
	"github.com/aws/aws-lambda-go/events"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

var _ = Describe("the auth function", func() {
	var (
		response events.APIGatewayCustomAuthorizerResponse
		request  events.APIGatewayCustomAuthorizerRequest
		err      error
	)

	JustBeforeEach(func() {
		response, err = handler(request)
	})

	AfterEach(func() {
		request = events.APIGatewayCustomAuthorizerRequest{}
		response = events.APIGatewayCustomAuthorizerResponse{}
	})

	Context("When the auth bearer is not set", func() {
		It("Fails auth", func() {
			Expect(err).To(MatchError("Unauthorized"))
			Expect(response).To(Equal(events.APIGatewayCustomAuthorizerResponse{}))
		})
	})

	Context("When the auth bearer is set", func() {
		Context("and auth succeeds", func() {
			BeforeEach(func() {
				request = events.APIGatewayCustomAuthorizerRequest{
					AuthorizationToken: "bearer Bob",
					MethodArn:          "testARN",
				}
			})

			It("authorizes", func() {
				Expect(err).To(BeNil())
				Expect(response.PolicyDocument.Version).To(Equal("2012-10-17"))
				Expect(response.PolicyDocument.Statement).To(Equal([]events.IAMPolicyStatement{
					{
						Action:   []string{"execute-api:Invoke"},
						Effect:   "Allow",
						Resource: []string{"testARN"},
					},
				}))
				Expect(response.Context["name"]).To(Equal("Bob"))
			})
		})
	})
})

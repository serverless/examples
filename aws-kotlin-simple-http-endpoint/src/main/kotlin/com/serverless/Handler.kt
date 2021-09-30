package com.serverless

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse
import org.apache.log4j.Logger
import java.time.Instant

class Handler : RequestHandler<APIGatewayV2HTTPEvent, APIGatewayV2HTTPResponse> {

  override fun handleRequest(event: APIGatewayV2HTTPEvent, context: Context): APIGatewayV2HTTPResponse {
    LOG.info("received: $event")
    return APIGatewayV2HTTPResponse.builder()
      .withStatusCode(200)
      .withBody("Hello, the current time is ${Instant.now()}")
      .withHeaders(mapOf("X-Powered-By" to "AWS Lambda & Serverless", "Content-Type" to "application/json"))
      .build()
  }

  companion object {
    private val LOG = Logger.getLogger(Handler::class.java)
  }
}

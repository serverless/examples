# frozen_string_literal: true

require 'json'

require_relative '../../common/validators/lottery_coupon_validator'
require_relative '../../common/helpers/requests_helper'
require_relative '../../common/serializers/error_serializer'
require_relative '../../common/services/create_sqs_message_service'

def run(event:, context:)
  body = transform_event_body(event['body'])
  validation = LotteryCouponValidator.new(body)
  return unprocessable_entity(validation.errors) if validation.failure?

  create_sqs_message(body)
end

def unprocessable_entity(errors)
  hash = { errors: serialize_errors(errors) }

  { statusCode: 422, body: JSON.generate(hash) }
end

def create_sqs_message(body)
  CreateSqsMessageService.new(body).call
  { statusCode: 200, body: JSON.generate(message: 'Message sent') }
rescue => error
  { statusCode: 500, body: JSON.generate(errors: error) }
end

def serialize_errors(errors)
  ErrorSerializer.serialize(errors)
end

def transform_event_body(body)
  Requests.new(body).call
end

# frozen_string_literal: true

require_relative '../../common/services/create_lottery_coupon_service'
require_relative '../../common/helpers/requests_helper'

def run(event:, context:)
  params = transform_event_body(event['Records'][0]['body'])
  CreateLotteryCouponService.new(params).call
end

def transform_event_body(body)
  Requests.new(body).call
end

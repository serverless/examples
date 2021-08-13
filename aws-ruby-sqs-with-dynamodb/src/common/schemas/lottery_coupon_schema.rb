# frozen_string_literal: true

require 'dry/schema'

LotteryCouponSchema = Dry::Schema.Params do
  required(:first_name).filled(:string)
  required(:last_name).filled(:string)
  required(:coupon_value).value(:integer, gt?: 0)
end

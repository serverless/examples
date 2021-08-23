# frozen_string_literal: true

require_relative '../schemas/lottery_coupon_schema'

class LotteryCouponValidator

  attr_reader :result, :coupon

  def initialize(coupon)
    @coupon = coupon
    @result = LotteryCouponSchema.call(coupon)
  end

  def failure?
    result.failure?
  end

  def errors
    result.errors.to_h
  end
end

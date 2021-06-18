# frozen_string_literal: true

require 'date'
require 'securerandom'

require_relative '../adapters/dynamo_db_adapter'

class CreateLotteryCouponService

  LotteryCouponSchema = Struct.new(:id, :first_name, :last_name, :coupon_value, :created_at)

  def initialize(attributes)
    @attributes = attributes
  end

  def call
    coupon = build_coupon
    save(coupon)
  end

  def save(coupon)
    DynamoDBAdapter.new.save_item(coupon)
  end

  private

  attr_reader :attributes

  def build_coupon
    LotteryCouponSchema.new(SecureRandom.uuid,
                            attributes[:first_name],
                            attributes[:last_name],
                            attributes[:coupon_value],
                            DateTime.now.iso8601).to_h
  end
end

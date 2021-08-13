# frozen_string_literal: true

require 'date'
require 'securerandom'
require 'faker'

require_relative '../adapters/dynamo_db_adapter'

class CreateMealOrderService

  MealOrderSchema = Struct.new(:id, :dish_name, :created_at)

  def call
    order = build_order
    save(order)
  end

  def save(order)
    DynamoDBAdapter.new.save_item(order)
  end

  private

  def build_order
    MealOrderSchema.new(SecureRandom.uuid,
                        Faker::Food.dish,
                        DateTime.now.iso8601).to_h
  end
end

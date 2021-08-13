# frozen_string_literal: true

require_relative '../../common/services/create_meal_order_service'

def run(event:, context:)
  CreateMealOrderService.new.call
end

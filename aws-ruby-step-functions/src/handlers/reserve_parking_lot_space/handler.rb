# frozen_string_literal: true

require 'json'

require_relative '../../common/services/reserve_parking_service'

def run(event:, context:)
  reserve_parking(event)
end

def reserve_parking(body)
  ReserveParkingService.new(body).reserve_parking
rescue => error
  { statusCode: 500, body: JSON.generate(errors: error) }
end

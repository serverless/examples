# frozen_string_literal: true

require 'json'

require_relative '../../common/services/reserve_parking_service'

def run(event:, context:)
  release_parking(parking_reservation(event))
end

def release_parking(parking_reservation)
  ReserveParkingService.new(parking_reservation).release_parking
  { statusCode: 200, body: JSON.generate(message: 'Parking released') }
rescue => error
  { statusCode: 500, body: JSON.generate(errors: error) }
end

def parking_reservation(event)
  { id: event }
end

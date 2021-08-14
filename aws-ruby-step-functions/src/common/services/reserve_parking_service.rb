# frozen_string_literal: true

require 'date'
require 'securerandom'

require_relative '../adapters/dynamo_db_adapter'

class ReserveParkingService

  ReserveParkingSchema = Struct.new(:id, :driver_plate, :check_in_date, :check_out_date, :current_status, :created_at)

  def initialize(attributes)
    @attributes = attributes
  end

  def reserve_parking
    reserveration_attributes = build_reserveration
    DynamoDBAdapter.new.save_item(reserveration_attributes)
    reserveration_attributes[:id]
  end

  def release_parking
    raise 'Missing item id' unless attributes[:id]

    DynamoDBAdapter.new.update_item(attributes[:id])
  end

  private

  attr_reader :attributes

  def default_status
    'submitted'
  end

  def build_reserveration
    ReserveParkingSchema.new(SecureRandom.uuid,
                             attributes[:driver_plate],
                             attributes[:check_in_date],
                             attributes[:check_out_date],
                             default_status,
                             DateTime.now.iso8601).to_h
  end
end

# frozen_string_literal: true

require 'date'
require 'securerandom'

require_relative '../adapters/dynamo_db_adapter'

class TicketService

  TicketSchema = Struct.new(:id, :first_name, :last_name, :check_in_date, :check_out_date, :current_status, :created_at)

  def initialize(attributes)
    @attributes = attributes
  end

  def create_ticket
    ticket_attribute = build_ticket
    DynamoDBAdapter.new.save_item(build_ticket)
    ticket_attribute[:id]
  end

  def cancel_ticket
    raise 'Missing item id' unless attributes[:id]

    DynamoDBAdapter.new.update_item(attributes[:id])
  end

  private

  attr_reader :attributes

  def default_status
    'submitted'
  end

  def build_ticket
    TicketSchema.new(SecureRandom.uuid,
                     attributes[:first_name],
                     attributes[:last_name],
                     attributes[:check_in_date],
                     attributes[:check_out_date],
                     default_status,
                     DateTime.now.iso8601).to_h
  end
end

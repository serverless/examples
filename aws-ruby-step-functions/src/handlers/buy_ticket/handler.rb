# frozen_string_literal: true

require 'json'

require_relative '../../common/services/ticket_service'

def run(event:, context:)
  create_ticket(event)
end

def create_ticket(body)
  TicketService.new(body).create_ticket
rescue => error
  { statusCode: 500, body: JSON.generate(errors: error) }
end

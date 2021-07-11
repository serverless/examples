# frozen_string_literal: true

require 'json'

require_relative '../../common/services/ticket_service'

def run(event:, context:)
  cancel_ticket(ticket_id(event))
end

def cancel_ticket(ticket_id)
  TicketService.new(ticket_id).cancel_ticket
  { statusCode: 200, body: JSON.generate(message: 'Ticket canceled') }
rescue => error
  { statusCode: 500, body: JSON.generate(errors: error) }
end

def ticket_id(event)
  { id: event }
end

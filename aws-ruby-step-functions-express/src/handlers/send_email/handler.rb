# frozen_string_literal: true

require_relative '../../common/services/send_email_service'

def run(event:, context:)
  SendEmailService.new.call
  { statusCode: 200, body: 'email send' }
rescue => error
  { statusCode: 500, body: JSON.generate(errors: error) }
end

# frozen_string_literal: true

require_relative '../adapters/ses_adapter'

class SendEmailService

  def call
    send
  end

  private

  def send
    SesAdapter.new.send_email
  end
end

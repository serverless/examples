# frozen_string_literal: true

require 'json'

require_relative '../../common/services/ticket_service'

def run(event:, context:)
  weather_options = %w[bad good]
  weather_options.sample
end

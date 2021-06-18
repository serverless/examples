# frozen_string_literal: true

class Requests
  def initialize(body)
    @body = body
  end

  def call
    transform_body(@body)
  end

  private

  def transform_body(body)
    JSON.parse(body).transform_keys(&:to_sym)
  end
end

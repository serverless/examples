# frozen_string_literal: true

require_relative '../adapters/sqs_adapter'

class CreateSqsMessageService

  def initialize(params)
    @params = params
  end

  def call
    message = sqs_message(params)
    send_message(message)
  end

  private

  attr_reader :params

  def send_message(message)
    SqsAdapter.new.send_message(message)
  end

  def sqs_message(params)
    {
      first_name: params[:first_name],
      last_name: params[:last_name],
      coupon_value: params[:coupon_value]
    }.to_json
  end
end

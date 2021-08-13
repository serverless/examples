# frozen_string_literal: true

require 'aws-sdk-sqs'
require 'logger'

class SqsAdapter

  def initialize
    @client = Aws::SQS::Client.new
  end

  def send_message(message)
    client.send_message(
      queue_url: ENV['QUEUE_URL'],
      message_body: message
    )
    logger.info('Created SQS message')
  rescue Aws::SQS::Errors::ServiceError => error
    logger.error(error)
  end

  private

  attr_reader :client

  def logger
    @logger ||= Logger.new($stdout)
  end
end

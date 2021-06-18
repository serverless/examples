# frozen_string_literal: true

require 'aws-sdk-dynamodb'
require 'logger'

class DynamoDBAdapter

  def initialize
    @client = Aws::DynamoDB::Client.new
  end

  def save_item(item)
    @client.put_item(table_item(item))
    logger.info("Created dynamoDB item with id=#{item[:id]}")
  rescue Aws::DynamoDB::Errors::ServiceError => error
    logger.error(error)
  end

  private

  def logger
    @logger ||= Logger.new($stdout)
  end

  def table_item(item)
    {
      table_name: ENV['TABLE_NAME'],
      item: item
    }
  end
end

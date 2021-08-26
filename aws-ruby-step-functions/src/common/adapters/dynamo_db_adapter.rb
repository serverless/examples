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
  rescue Aws::DynamoDB::Errors => error
    logger.error(error)
  end

  def update_item(item_id)
    @client.update_item(update_item_params(item_id))
    logger.info("Updated dynamoDB item with id=#{item_id}")
  rescue Aws::DynamoDB::Errors => error
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

  def update_item_params(item_id)
    {
      expression_attribute_values: {
        ':s': 'canceled'
      },
      key: {
        id: item_id
      },
      return_values: 'UPDATED_NEW',
      table_name: ENV['TABLE_NAME'],
      update_expression: 'set current_status=:s'
    }
  end
end

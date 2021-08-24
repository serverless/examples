# frozen_string_literal: true

require 'aws-sdk-states'
require 'logger'

class StepFunctionsAdapter

  attr_reader :sf_client, :task_token, :output

  def initialize(task_token:, output:)
    @sf_client = Aws::States::Client.new
    @task_token = task_token
    @output = output
  end

  def send_task_success
    sf_client.send_task_success(success_task_token_data(task_token: task_token, output: JSON.generate(output)))
    logger.info('Success task')
  end

  def send_task_failure
    sf_client.send_task_failure(failure_task_token_data(task_token: task_token, output: output))
    logger.info('Failed task')
  end

  private

  def success_task_token_data(task_token:, output:)
    {
      task_token: task_token,
      output: output
    }
  end

  def failure_task_token_data(task_token:, output:)
    {
      task_token: task_token,
      error: output
    }
  end

  def logger
    @logger ||= Logger.new($stdout)
  end
end

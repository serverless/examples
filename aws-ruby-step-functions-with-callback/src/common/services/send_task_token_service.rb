# frozen_string_literal: true

require_relative '../adapters/step_functions_adapter'

class SendTaskTokenService

  def initialize(task_token, status, output)
    @task_token = task_token
    @status = status
    @output = output
  end

  def call
    send_task
  end

  private

  attr_reader :task_token, :status, :output

  def send_task
    send_task = StepFunctionsAdapter.new(task_token: task_token, output: output)
    if status_success?
      send_task.send :send_task_success
    else
      send_task.send :send_task_failure
    end
  end

  def status_success?
    status == 'success'
  end
end

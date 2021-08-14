# frozen_string_literal: true

require_relative '../../common/services/send_task_token_service'
require_relative '../../common/services/detection_service'

def run(event:, context:)
  task_token = event['task_token']
  comment = event['comment']

  check_content_comment(comment, task_token)
end

def send_task_token(task_token, status, response)
  SendTaskTokenService.new(task_token, status, response).call
end

def check_content_comment(comment, task_token)
  response = DetectionService.new(comment).call
  send_task_token(task_token, 'success', response)
rescue => error
  send_task_token(task_token, 'failure', error)
end

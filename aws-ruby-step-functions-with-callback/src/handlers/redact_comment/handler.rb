# frozen_string_literal: true

require_relative '../../common/services/redaction_service'

def run(event:, context:)
  comment = event['comment']
  detection_result = event['result']
  redact_comment(comment, detection_result)
end

def redact_comment(comment, detection_result)
  RedactionService.new(comment, detection_result).call
end

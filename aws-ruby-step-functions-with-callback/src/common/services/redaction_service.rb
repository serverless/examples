# frozen_string_literal: true

class RedactionService

  CHARACTER_TO_CLEANUP_CONTENT = '*'

  def initialize(comment_to_redact, detection_result)
    @comment_to_redact = comment_to_redact
    @detection_result = detection_result
  end

  def call
    redact_note(detection_result, comment_to_redact)
  end

  attr_reader :comment_to_redact, :detection_result

  private

  def redact_note(entities, comment_to_redact)
    redacted_comment = comment_to_redact.dup
    entities.each do |entity|
      redacted_comment[entity['begin_offset'], entity_offset_difference(entity)] = CHARACTER_TO_CLEANUP_CONTENT * entity_offset_difference(entity)
    end
    redacted_comment
  end

  def entity_offset_difference(entity)
    entity['end_offset'] - entity['begin_offset']
  end
end

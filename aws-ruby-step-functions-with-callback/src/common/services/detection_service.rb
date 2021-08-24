# frozen_string_literal: true

require 'aws-sdk-comprehend'

class DetectionService

  DetectionSchema = Struct.new(:begin_offset, :end_offset)

  def initialize(comment)
    @comprehend_client = Aws::Comprehend::Client.new(region: ENV['region'])
    @comment = comment
    @result = []
  end

  def call
    result = detect_pii_entities(comment)
    pii_detected?(result) ? build_result(result.entities) : 'No result'
  end

  attr_reader :comprehend_client, :comment, :result

  private

  def build_result(entities)
    structed_result = []
    entities.each do |entity|
      structed_result << Hash[begin_offset: entity[:begin_offset], end_offset: entity[:end_offset]]
    end
    structed_result
  end

  def detect_pii_entities(content_to_be_analyzed)
    comprehend_client.detect_pii_entities(text: content_to_be_analyzed, language_code: 'en')
  end

  def pii_detected?(result)
    result.entities.any?
  end
end

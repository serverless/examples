# frozen_string_literal: true

module ErrorSerializer
  def self.serialize(exception)
    handle_unprocessable_exception(exception)
  end

  def self.dry_errors(exception)
    exception.map do |field, error_message_array|
      {
        status: 422,
        source: { pointer: field },
        detail: error_message_array[0]
      }
    end.flatten
  end

  def self.handle_unprocessable_exception(exception)
    dry_errors(exception)
  end
end

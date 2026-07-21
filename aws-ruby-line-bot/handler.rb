# frozen_string_literal: true

require 'json'
require 'line-bot-api'

def client
  @client ||= Line::Bot::V2::MessagingApi::ApiClient.new(
    channel_access_token: ENV.fetch('LINE_CHANNEL_ACCESS_TOKEN')
  )
end

def parser
  @parser ||= Line::Bot::V2::WebhookParser.new(channel_secret: ENV.fetch('LINE_CHANNEL_SECRET'))
end

def webhook(event:, context:)
  body = event['body']
  signature = header_value(event['headers'], 'x-line-signature')

  begin
    line_events = parser.parse(body: body, signature: signature)
  rescue Line::Bot::V2::WebhookParser::InvalidSignatureError
    return { statusCode: 400, body: JSON.generate(message: 'Invalid signature') }
  end

  line_events.each { |line_event| handle_event(line_event) }

  { statusCode: 200, body: JSON.generate(message: 'OK') }
end

def handle_event(line_event)
  return unless line_event.is_a?(Line::Bot::V2::Webhook::MessageEvent)
  return unless line_event.message.is_a?(Line::Bot::V2::Webhook::TextMessageContent)

  request = Line::Bot::V2::MessagingApi::ReplyMessageRequest.new(
    reply_token: line_event.reply_token,
    messages: [Line::Bot::V2::MessagingApi::TextMessage.new(text: line_event.message.text)]
  )
  client.reply_message(reply_message_request: request)
end

def header_value(headers, name)
  return nil unless headers

  key = headers.keys.find { |candidate| candidate.casecmp?(name) }
  key && headers[key]
end

require 'line/bot'

def webhook(event:, context:)
  client ||= Line::Bot::Client.new { |config|
    config.channel_secret = "YOUR_LINE_CHANNEL_SECRET"
    config.channel_token = "YOUR_LINE_CHANNEL_TOKEN"
  }
  
  event = JSON.parse(event["body"])
  reply_token = event["events"][0]["replyToken"]
  message = {
    type: 'text',
    text: event["events"][0]["message"]["text"]
  }
  
  response = client.reply_message(reply_token, message)
  
  { statusCode: 200, body: JSON.generate({message: "OK"}) }
end
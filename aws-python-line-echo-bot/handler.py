import json
from linebot import (
    LineBotApi, WebhookHandler
)
from linebot.models import (
    MessageEvent, TextMessage, TextSendMessage,
)


def webhook(event, context):
    line_bot_api = LineBotApi('YOUR_CHANNEL_ACCESS_TOKEN')
    handler = WebhookHandler('YOUR_CHANNEL_SECRET')

    msg = json.loads(event['body'])
    line_bot_api.reply_message(
        msg['events'][0]['replyToken'],
        TextSendMessage(text=msg['events'][0]['message']['text'])
    )
    response = {
        "statusCode": 200,
        "body": json.dumps({"message": 'ok'})
    }

    return response

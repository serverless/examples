import json
import os

from linebot.v3 import WebhookParser
from linebot.v3.exceptions import InvalidSignatureError
from linebot.v3.messaging import (
    ApiClient,
    Configuration,
    MessagingApi,
    ReplyMessageRequest,
    TextMessage,
)
from linebot.v3.webhooks import MessageEvent, TextMessageContent

CHANNEL_ACCESS_TOKEN = os.environ.get('CHANNEL_ACCESS_TOKEN', 'YOUR_CHANNEL_ACCESS_TOKEN')
CHANNEL_SECRET = os.environ.get('CHANNEL_SECRET', 'YOUR_CHANNEL_SECRET')

configuration = Configuration(access_token=CHANNEL_ACCESS_TOKEN)
parser = WebhookParser(CHANNEL_SECRET)


def webhook(event, context):
    headers = event.get('headers') or {}
    signature = headers.get('x-line-signature') or headers.get('X-Line-Signature')
    body = event.get('body') or ''

    try:
        line_events = parser.parse(body, signature)
    except InvalidSignatureError:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": "Invalid signature"}),
        }

    with ApiClient(configuration) as api_client:
        line_bot_api = MessagingApi(api_client)
        for line_event in line_events:
            if isinstance(line_event, MessageEvent) and isinstance(line_event.message, TextMessageContent):
                line_bot_api.reply_message(
                    ReplyMessageRequest(
                        reply_token=line_event.reply_token,
                        messages=[TextMessage(text=line_event.message.text)],
                    )
                )

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "ok"}),
    }

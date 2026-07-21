import asyncio
import json
import logging
import os

import telegram

# Logging is cool!
logger = logging.getLogger()
if logger.handlers:
    for handler in logger.handlers:
        logger.removeHandler(handler)
logging.basicConfig(level=logging.INFO)

OK_RESPONSE = {
    'statusCode': 200,
    'headers': {'Content-Type': 'application/json'},
    'body': json.dumps('ok')
}
ERROR_RESPONSE = {
    'statusCode': 400,
    'body': json.dumps('Oops, something went wrong!')
}


def get_telegram_token():
    """
    Reads the Telegram Token from the environment.
    """

    telegram_token = os.environ.get('TELEGRAM_TOKEN')
    if not telegram_token:
        logger.error('The TELEGRAM_TOKEN must be set')
        raise NotImplementedError

    return telegram_token


async def send_message(chat_id, text):
    """
    Sends a message using a short-lived Bot instance.

    python-telegram-bot >= 20 is fully async, so the Bot must be used as an
    async context manager (this takes care of opening/closing its HTTP
    session) and every API call awaited.
    """

    async with telegram.Bot(get_telegram_token()) as bot:
        await bot.send_message(chat_id=chat_id, text=text)


async def configure_webhook(url):
    """
    Sets the bot's webhook URL using a short-lived Bot instance.
    """

    async with telegram.Bot(get_telegram_token()) as bot:
        return await bot.set_webhook(url)


def webhook(event, context):
    """
    Runs the Telegram webhook.
    """

    logger.info('Event: {}'.format(event))

    if event.get('httpMethod') == 'POST' and event.get('body'):
        logger.info('Message received')
        update = telegram.Update.de_json(json.loads(event.get('body')), None)
        chat_id = update.message.chat.id
        text = update.message.text

        if text == '/start':
            text = """Hello, human! I am an echo bot, built with Python and the Serverless Framework.
            You can take a look at my source code here: https://github.com/jonatasbaldin/serverless-telegram-bot.
            If you have any issues, please drop a tweet to my creator: https://twitter.com/jonatsbaldin. Happy botting!"""

        asyncio.run(send_message(chat_id, text))
        logger.info('Message sent')

        return OK_RESPONSE

    return ERROR_RESPONSE


def set_webhook(event, context):
    """
    Sets the Telegram bot webhook.
    """

    logger.info('Event: {}'.format(event))
    url = 'https://{}/{}/'.format(
        event.get('headers').get('Host'),
        event.get('requestContext').get('stage'),
    )
    webhook_set = asyncio.run(configure_webhook(url))

    if webhook_set:
        return OK_RESPONSE

    return ERROR_RESPONSE

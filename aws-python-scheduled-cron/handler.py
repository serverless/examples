import datetime
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def run(event, context):
    current_time = datetime.datetime.now().time()
    logger.info("Your cron function ran at " + str(current_time))


def cron(event, context):
    current_time = datetime.datetime.now().time()
    logger.info("Your weekday cron function ran at " + str(current_time))

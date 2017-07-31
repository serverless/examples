import datetime
import os

def run(params):
    current_time = datetime.datetime.now().time()
    name = os.environ['__OW_ACTION_NAME']
    print("Your cron function " + name + " ran at " + str(current_time))
    return {}

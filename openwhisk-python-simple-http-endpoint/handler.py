import json
import datetime

def endpoint(params):
    current_time = datetime.datetime.now().time()
    name = params.get("name", "stranger")
    body = {
        "message": "Hello " + name + ", the current time is " + str(current_time)
    }
    return body

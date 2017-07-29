import json
import logging

from todos.makeresult import make_result
from todos import client, TODOS

from faunadb import query

def create(event, context):
    data = json.loads(event['body'])
    if 'text' not in data:
        logging.error("Validation Failed")
        raise Exception("Couldn't create the todo item.")

    data = {
        'text': data['text'],
        'checked': False,
        'createdAt': query.time('now'),
        'updatedAt': query.time('now')
    }

    # write the todo to the database
    created = client.query(query.create(TODOS, {'data': data}))

    # create a response
    response = {
        "statusCode": 200,
        "body": json.dumps(make_result(created))
    }

    return response

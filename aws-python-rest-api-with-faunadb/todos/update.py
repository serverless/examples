import json
import logging

from todos.makeresult import make_result
from todos import client, TODOS

from faunadb.objects import Ref
from faunadb import query

def update(event, context):
    data = json.loads(event['body'])
    if 'text' not in data or 'checked' not in data:
        logging.error("Validation Failed")
        raise Exception("Couldn't update the todo item.")

    data = {
        'text': data['text'],
        'checked': data['checked'],
        'updatedAt': query.time('now')
    }

    # update the todo in the database
    ref = Ref(TODOS, event['pathParameters']['id'])
    updated = client.query(query.update(ref, {'data': data}))

    # create a response
    response = {
        "statusCode": 200,
        "body": json.dumps(make_result(updated))
    }

    return response

import json

from todos.makeresult import make_result
from todos import client, TODOS

from faunadb.objects import Ref
from faunadb import query

def get(event, context):
    # fetch todo from the database
    ref = Ref(TODOS, event['pathParameters']['id'])
    fetched = client.query(query.get(ref))

    # create a response
    response = {
        "statusCode": 200,
        "body": json.dumps(make_result(fetched))
    }

    return response

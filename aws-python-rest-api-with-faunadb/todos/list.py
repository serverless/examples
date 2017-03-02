import json

from todos.makeresult import make_result
from todos import client, ALL_TODOS

from faunadb import query

def list(event, context):
    # fetch all todos from the database
    results = client.query(
        query.map_expr(lambda ref: query.get(ref),
                       query.paginate(query.match(ALL_TODOS))))

    # create a response
    response = {
        "statusCode": 200,
        "body": json.dumps(map(make_result, results['data']))
    }

    return response

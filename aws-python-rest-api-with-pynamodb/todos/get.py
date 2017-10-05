import json

from pynamodb.exceptions import DoesNotExist
from todos.todo_model import TodoModel


def get(event, context):
    try:
        found_todo = TodoModel.get(hash_key=event['path']['todo_id'])
    except DoesNotExist:
        return {'statusCode': 404,
                'body': json.dumps({'error_message': 'TODO was not found'})}

    # create a response
    return {'statusCode': 200,
            'body': json.dumps(dict(found_todo))}

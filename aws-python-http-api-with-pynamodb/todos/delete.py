import json

from pynamodb.exceptions import DoesNotExist, DeleteError
from todos.todo_model import TodoModel


def delete(event, context):
    try:
        found_todo = TodoModel.get(hash_key=event['path']['todo_id'])
    except DoesNotExist:
        return {'statusCode': 404,
                'body': json.dumps({'error_message': 'TODO was not found'})}
    try:
        found_todo.delete()
    except DeleteError:
        return {'statusCode': 400,
                'body': json.dumps({'error_message': 'Unable to delete the TODO'})}

    # create a response
    return {'statusCode': 204}

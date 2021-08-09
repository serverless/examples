import json
import logging

from pynamodb.exceptions import DoesNotExist
from todos.todo_model import TodoModel


def update(event, context):
    # TODO: Figure out why this is behaving differently to the other endpoints
    # data = json.loads(event['body'])
    data = event['body']

    if 'text' not in data and 'checked' not in data:
        logging.error('Validation Failed %s', data)
        return {'statusCode': 422,
                'body': json.dumps({'error_message': 'Couldn\'t update the todo item.'})}

    try:
        found_todo = TodoModel.get(hash_key=event['path']['todo_id'])
    except DoesNotExist:
        return {'statusCode': 404,
                'body': json.dumps({'error_message': 'TODO was not found'})}

    todo_changed = False
    if 'text' in data and data['text'] != found_todo.text:
        found_todo.text = data['text']
        todo_changed = True
    if 'checked' in data and data['checked'] != found_todo.checked:
        found_todo.checked = data['checked']
        todo_changed = True

    if todo_changed:
        found_todo.save()
    else:
        logging.info('Nothing changed did not update')

    # create a response
    return {'statusCode': 200,
            'body': json.dumps(dict(found_todo))}


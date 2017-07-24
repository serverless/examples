import json
import logging
import uuid

from todos.todo_model import TodoModel


def create(event, context):
    data = json.loads(event['body'])
    if 'text' not in data:
        logging.error('Validation Failed')
        return {'statusCode': 422,
                'body': json.dumps({'error_message': 'Couldn\'t create the todo item.'})}

    if not data['text']:
        logging.error('Validation Failed - text was empty. %s', data)
        return {'statusCode': 422,
                'body': json.dumps({'error_message': 'Couldn\'t create the todo item. As text was empty.'})}

    a_todo = TodoModel(todo_id=str(uuid.uuid1()),
                       text=data['text'],
                       checked=False)

    # write the todo to the database
    a_todo.save()

    # create a response
    return {'statusCode': 201,
            'body': json.dumps(dict(a_todo))}


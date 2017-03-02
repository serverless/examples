from todos import client, TODOS, ALL_TODOS

from faunadb import query

def schema(event, context):
    create_todos = query.create_class({
        'name': 'todos'
    })

    create_all_todos = query.create_index({
        'name': 'all_todos',
        'source': TODOS
    })

    client.query(query.if_expr(
        query.exists(TODOS),
        query.get(TODOS),
        create_todos
    ))

    client.query(query.if_expr(
        query.exists(ALL_TODOS),
        query.get(ALL_TODOS),
        create_all_todos
    ))

    # create a response
    response = {
        "statusCode": 200
    }

    return response

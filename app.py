import os

import boto3
from flask import Flask, jsonify, make_response, request

app = Flask(__name__)


dynamodb_client = boto3.client('dynamodb')

# if os.environ.get('IS_OFFLINE'):
#     dynamodb_client = boto3.client(
#         'dynamodb', region_name='localhost', endpoint_url='http://localhost:8000'
#     )

USERS_TABLE = os.environ['USERS_TABLE']

@app.route('/users', methods=['POST'])
def create_user():
    status = request.form['Body']
    phone_number = request.form['From']
    if not status or not phone_number:
        return jsonify({'error': 'Please provide both "status" and "phone_number"'}), 400

    dynamodb_client.put_item(
        TableName=USERS_TABLE, Item={'status': {'S': status}, 'phone_number': {'S': phone_number}}
    )

    return jsonify({'status': status, 'phone_number': phone_number})


@app.errorhandler(404)
def resource_not_found(e):
    return make_response(jsonify(error='Not found!'), 404)

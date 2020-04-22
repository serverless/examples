import json
import os
import pymongo

# Fetch mongo env vars
usr = os.environ['MONGO_DB_USER']
pwd = os.environ['MONGO_DB_PASS']
mongo_db_name = os.environ['MONGO_DB_NAME']
mongo_collection_name = os.environ['MONGO_COLLECTION_NAME']
url = os.environ['MONGO_DB_URL']

# Connection String
client = pymongo.MongoClient("mongodb+srv://" + usr + ":" + pwd + "@" + url + "/test?retryWrites=true&w=majority")
db = client[mongo_db_name]
collection = db[mongo_collection_name]


def list(event, context):
    # create response body object
    response_body = {}

    # create array for reponse items
    response_body['response_items'] = []

    # return path parameters with filter key
    response_body['filter'] = event['multiValueQueryStringParameters']

    # build query with any path parameters
    query = {}
    if event['multiValueQueryStringParameters'] is not None:
        for parameter in event['multiValueQueryStringParameters']:
            query[parameter] = event['multiValueQueryStringParameters'][parameter][0]

    # create list of items
    cursor = collection.find(query)
    for document in cursor:
        response_body['response_items'].append(document)

    # create response
    response = {
        "statusCode": 200,
        "body": json.dumps(response_body)
    }

    # return response
    return response

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


def delete(event, context):
    # get item_id to delete from path parameter
    item_id = event['pathParameters']['id']

    # delete item from the database
    del_resp = collection.delete_one({"_id": item_id})

    # if no item return 404
    if del_resp.deleted_count == 0:

        response = {
            "statusCode": 404,
        }

        return response

    # create a response
    response = {
        "statusCode": 204,
    }

    return response

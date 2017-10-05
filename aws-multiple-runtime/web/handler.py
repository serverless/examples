from datetime import datetime
import http.client

def hello(event, context):
    rc = event["requestContext"]
    servicePath = rc["path"][:-len(rc["resourcePath"])] # path minus the resource path '/greet'

    # GET from the /time endpoint
    connection = http.client.HTTPSConnection(event["headers"]["Host"])
    connection.request("GET", "{0}/time".format(servicePath))
    timestamp = connection.getresponse().read().decode()
    timeStr = datetime.fromtimestamp(int(timestamp)).strftime("%B %d, %Y")

    return {
        "statusCode": 200,
        "body": "<html><body><p>Hello! It is now {0}.</p></body></html>".format(timeStr),
        "headers": {
            "Content-Type": "text/html"
        }
    }

from datetime import datetime
import http.client


def hello(event, context):
    # HTTP API (payload format 2.0) request path, e.g. '/greet'. Unlike REST API's
    # payload format 1.0, there's no requestContext.resourcePath to diff against a
    # stage-prefixed path: httpApi always deploys to the $default stage, so rawPath
    # already has no stage prefix to strip.
    service_path = event["rawPath"].rsplit("/", 1)[0]

    # GET from the /time endpoint
    connection = http.client.HTTPSConnection(event["requestContext"]["domainName"])
    connection.request("GET", f"{service_path}/time")
    timestamp = connection.getresponse().read().decode()
    time_str = datetime.fromtimestamp(int(timestamp)).strftime("%B %d, %Y")

    return {
        "statusCode": 200,
        "body": f"<html><body><p>Hello! It is now {time_str}.</p></body></html>",
        "headers": {
            "Content-Type": "text/html"
        }
    }

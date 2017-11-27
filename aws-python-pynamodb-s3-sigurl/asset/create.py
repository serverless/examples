import uuid
import http.client as httplib
from asset.asset_model import AssetModel
from log_cfg import logger


def create(event, context):
    """
     No body needed here as POST is a request for a pre-signed upload URL.
     Create an entry for it in dynamo and return upload URL
    """
    # Sample events using different lambda integrations:
    #
    # _lambda_proxy_event = {'resource': '/asset', 'path': '/asset', 'httpMethod': 'POST',
    #                        'headers': {'Accept': '*/*', 'CloudFront-Forwarded-Proto': 'https',
    #                                    'CloudFront-Is-Desktop-Viewer': 'true', 'CloudFront-Is-Mobile-Viewer': 'false',
    #                                    'CloudFront-Is-SmartTV-Viewer': 'false', 'CloudFront-Is-Tablet-Viewer': 'false',
    #                                    'CloudFront-Viewer-Country': 'US',
    #                                    'Host': 'c1xblyjsid.execute-api.us-east-1.amazonaws.com',
    #                                    'User-Agent': 'curl/7.56.1',
    #                                    'Via': '1.1 5c75b37c7e0aa5868b6499a5c4448d1f.cloudfront.net (CloudFront)',
    #                                    'X-Amz-Cf-Id': 'XG5WkkaGYGdbA9KAm7Hsbl5t7D7KmALE4Q2LdOwbXYoCFJZxyyiARw==',
    #                                    'X-Amzn-Trace-Id': 'Root=1-5a1b28a6-2b6e5ef6657e0f5f2d671017',
    #                                    'X-Forwarded-For': '75.82.111.45, 216.137.44.44', 'X-Forwarded-Port': '443',
    #                                    'X-Forwarded-Proto': 'https'}, 'queryStringParameters': None,
    #                        'pathParameters': None, 'stageVariables': None,
    #                        'requestContext': {'requestTime': '26/Nov/2017:20:48:38 +0000', 'path': '/dev/asset',
    #                                           'accountId': '818300131735', 'protocol': 'HTTP/1.1',
    #                                           'resourceId': 'wpjmgf', 'stage': 'dev', 'requestTimeEpoch': 1511729318077,
    #                                           'requestId': '2d827060-d2eb-11e7-96f5-9b58ecc94e3f',
    #                                           'identity': {'cognitoIdentityPoolId': None, 'accountId': None,
    #                                                        'cognitoIdentityId': None, 'caller': None, 'apiKey': '',
    #                                                        'sourceIp': '75.82.111.45', 'accessKey': None,
    #                                                        'cognitoAuthenticationType': None,
    #                                                        'cognitoAuthenticationProvider': None, 'userArn': None,
    #                                                        'userAgent': 'curl/7.56.1', 'user': None},
    #                                           'resourcePath': '/asset', 'httpMethod': 'POST', 'apiId': 'c1xblyjsid'},
    #                        'body': None, 'isBase64Encoded': False}
    #
    # _lambda_event = {'body': {}, 'method': 'POST', 'principalId': '', 'stage': 'dev', 'cognitoPoolClaims': {'sub': ''},
    #                  'headers': {'Accept': '*/*', 'CloudFront-Forwarded-Proto': 'https',
    #                              'CloudFront-Is-Desktop-Viewer': 'true', 'CloudFront-Is-Mobile-Viewer': 'false',
    #                              'CloudFront-Is-SmartTV-Viewer': 'false', 'CloudFront-Is-Tablet-Viewer': 'false',
    #                              'CloudFront-Viewer-Country': 'US',
    #                              'Host': 'c1xblyjsid.execute-api.us-east-1.amazonaws.com', 'User-Agent': 'curl/7.56.1',
    #                              'Via': '1.1 022c901b294fedd7074704d46fce9819.cloudfront.net (CloudFront)',
    #                              'X-Amz-Cf-Id': 'BifKUMLw8qO30TNbJ4QObNGq6WVxiL9nTv9eMbRtAIqqHIqQDkZEVw==',
    #                              'X-Amzn-Trace-Id': 'Root=1-5a1b387c-47ab478111bbb2eb6bd6530c',
    #                              'X-Forwarded-For': '75.82.111.45, 216.137.44.14', 'X-Forwarded-Port': '443',
    #                              'X-Forwarded-Proto': 'https'}, 'query': {}, 'path': {},
    #                  'identity': {'cognitoIdentityPoolId': '', 'accountId': '', 'cognitoIdentityId': '', 'caller': '',
    #                               'apiKey': '', 'sourceIp': '75.82.111.45', 'accessKey': '',
    #                               'cognitoAuthenticationType': '', 'cognitoAuthenticationProvider': '', 'userArn': '',
    #                               'userAgent': 'curl/7.56.1', 'user': ''}, 'stageVariables': {}}

    logger.debug('event: {}'.format(event))
    asset = AssetModel()
    asset.asset_id = uuid.uuid1().__str__()
    asset.save()
    upload_url = asset.get_upload_url()  # No timeout specified here, use member param default

    return {
        "statusCode": httplib.CREATED,
        "body": {
            'upload_url': upload_url,
            'id': asset.asset_id
        }
    }

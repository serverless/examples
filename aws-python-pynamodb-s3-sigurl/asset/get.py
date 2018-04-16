import os
import http.client as httplib
from pynamodb.exceptions import DoesNotExist
from asset.asset_model import AssetModel
from log_cfg import logger


def get(event, context):
    """
    Get a presigned download URL for asset <asset-id>
    """
    # Sample events using different lambda integrations:
    #
    # _lambda_event = {
    #     'body': {}, 'method': 'GET', 'principalId': '', 'stage': 'dev', 'cognitoPoolClaims': {'sub': ''},
    #     'headers': {'Accept': '*/*', 'CloudFront-Forwarded-Proto': 'https', 'CloudFront-Is-Desktop-Viewer': 'true',
    #                 'CloudFront-Is-Mobile-Viewer': 'false', 'CloudFront-Is-SmartTV-Viewer': 'false',
    #                 'CloudFront-Is-Tablet-Viewer': 'false', 'CloudFront-Viewer-Country': 'US',
    #                 'Host': 'c1xblyjsid.execute-api.us-east-1.amazonaws.com', 'User-Agent': 'curl/7.56.1',
    #                 'Via': '1.1 57933097ddb189ecc8b3745fb94cfa94.cloudfront.net (CloudFront)',
    #                 'X-Amz-Cf-Id': 'W95mJn3pc3G8T85Abt2Dj_wLPE_Ar_q0k56uF5yreiaNOMn6P2Nltw==',
    #                 'X-Amzn-Trace-Id': 'Root=1-5a1b453d-1e857d3548e38a1c2827969e',
    #                 'X-Forwarded-For': '75.82.111.45, 216.137.44.17', 'X-Forwarded-Port': '443',
    #                 'X-Forwarded-Proto': 'https'}, 'query': {},
    #     'path': {'asset_id': '0e4e06c6-d2fc-11e7-86c6-6672893a702e'},
    #     'identity': {'cognitoIdentityPoolId': '', 'accountId': '', 'cognitoIdentityId': '', 'caller': '',
    #                  'apiKey': '', 'sourceIp': '75.82.111.45', 'accessKey': '', 'cognitoAuthenticationType': '',
    #                  'cognitoAuthenticationProvider': '', 'userArn': '', 'userAgent': 'curl/7.56.1', 'user': ''},
    #     'stageVariables': {}}
    #
    # _lambda_event_with_timeout = {
    #     'body': {}, 'method': 'GET', 'principalId': '', 'stage': 'dev',
    #     'cognitoPoolClaims': {'sub': ''},
    #     'headers': {'Accept': '*/*', 'CloudFront-Forwarded-Proto': 'https',
    #                 'CloudFront-Is-Desktop-Viewer': 'true',
    #                 'CloudFront-Is-Mobile-Viewer': 'false',
    #                 'CloudFront-Is-SmartTV-Viewer': 'false',
    #                 'CloudFront-Is-Tablet-Viewer': 'false', 'CloudFront-Viewer-Country': 'US',
    #                 'Host': 'c1xblyjsid.execute-api.us-east-1.amazonaws.com',
    #                 'User-Agent': 'curl/7.56.1',
    #                 'Via': '1.1 7acf1813f9ec06038d676de15fcfc28f.cloudfront.net (CloudFront)',
    #                 'X-Amz-Cf-Id': 'RBFBVYMys7aDqQ8u2Ktqvd-ZNwy-Kg7LPZ9LBTe-42nnx1wh0b5bGg==',
    #                 'X-Amzn-Trace-Id': 'Root=1-5a1b4655-785e402d33e13e9d533281ef',
    #                 'X-Forwarded-For': '75.82.111.45, 216.137.44.103',
    #                 'X-Forwarded-Port': '443', 'X-Forwarded-Proto': 'https'},
    #     'query': {'timeout': '1000000'},
    #     'path': {'asset_id': '0e4e06c6-d2fc-11e7-86c6-6672893a702e'},
    #     'identity': {'cognitoIdentityPoolId': '', 'accountId': '', 'cognitoIdentityId': '',
    #                  'caller': '', 'apiKey': '', 'sourceIp': '75.82.111.45', 'accessKey': '',
    #                  'cognitoAuthenticationType': '', 'cognitoAuthenticationProvider': '',
    #                  'userArn': '', 'userAgent': 'curl/7.56.1', 'user': ''},
    #     'stageVariables': {}}

    logger.debug('event: {}'.format(event))
    try:
        ttl = os.environ['URL_DEFAULT_TTL']
        try:
            ttl = int(event['query']['timeout'])
        except KeyError or ValueError:
            pass
        asset_id = event['path']['asset_id']
        asset = AssetModel.get(hash_key=asset_id)
        download_url = asset.get_download_url(ttl)

    except DoesNotExist:
        return {
            'statusCode': httplib.NOT_FOUND,
            'body': {
                'error_message': 'ASSET {} not found'.format(asset_id)
            }
        }

    except AssertionError as e:
        return {
            'statusCode': httplib.FORBIDDEN,
            'body': {
                'error_message': 'Unable to download: {}'.format(e)
            }
        }

    return {
        "statusCode": httplib.ACCEPTED,
        "body": {
            'download_url': download_url
        }
    }

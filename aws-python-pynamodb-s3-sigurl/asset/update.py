import http.client as httplib
from pynamodb.exceptions import DoesNotExist

from asset.asset_model import AssetModel
from log_cfg import logger


def update(event, context):
    logger.debug('event: {}'.format(event))
    try:
        asset_id = event['path']['asset_id']
        asset = AssetModel.get(hash_key=asset_id)
        asset.mark_uploaded()

    except AssertionError as e:
        return {
            'statusCode': httplib.PRECONDITION_FAILED,
            'body': {
                'error_message': 'ASSET {} state incorrect: {}'.format(asset_id, e)
            }
        }

    except DoesNotExist:
        return {
            'statusCode': httplib.NOT_FOUND,
            'body': {
                'error_message': 'ASSET {} not found'.format(asset_id)
            }
        }

    return {
        "statusCode": httplib.ACCEPTED,
        "body": {
            'status': asset.state
        }
    }

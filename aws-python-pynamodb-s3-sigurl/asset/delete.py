import http.client as httplib
from pynamodb.exceptions import DoesNotExist, DeleteError
from asset.asset_model import AssetModel
from log_cfg import logger


def delete(event, context):
    logger.debug('event: {}'.format(event))
    try:
        asset_id = event['path']['asset_id']
        asset = AssetModel.get(hash_key=asset_id)
    except DoesNotExist:
        return {
            'statusCode': httplib.NOT_FOUND,
            'body': {
                'error_message': 'ASSET {} not found'.format(asset_id)
            }
        }
    try:
        asset.mark_deleted()
    except DeleteError:
        return {
            'statusCode': httplib.BAD_REQUEST,
            'body': {
                'error_message': 'Unable to delete ASSET {}'.format(asset)
            }
        }

    return {'statusCode': httplib.NO_CONTENT}

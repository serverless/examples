from datetime import datetime
from enum import Enum
import boto3
import os
from pynamodb.attributes import UnicodeAttribute, UTCDateTimeAttribute
from pynamodb.models import Model
from log_cfg import logger

BUCKET = os.environ['S3_BUCKET']
KEY_BASE = os.environ['S3_KEY_BASE']


class State(Enum):
    """
    Manage asset states in dynamo with a string field
    Could have used an int as well, or used a custom serializer which is a bit cleaner.
    """
    CREATED = 1
    RECEIVED = 2
    UPLOADED = 3
    DELETED = 4


class AssetModel(Model):
    class Meta:
        table_name = os.environ['DYNAMODB_TABLE']
        if 'ENV' in os.environ:
            host = 'http://localhost:8000'
        else:
            region = os.environ['REGION']
            host = os.environ['DYNAMODB_HOST']
            # 'https://dynamodb.us-east-1.amazonaws.com'

    asset_id = UnicodeAttribute(hash_key=True)
    state = UnicodeAttribute(null=False, default=State.CREATED.name)
    createdAt = UTCDateTimeAttribute(null=False, default=datetime.now().astimezone())
    updatedAt = UTCDateTimeAttribute(null=False, default=datetime.now().astimezone())

    def __str__(self):
        return 'asset_id:{}, state:{}'.format(self.asset_id, self.state)

    def get_key(self):
        return u'{}/{}'.format(KEY_BASE, self.asset_id)

    def save(self, conditional_operator=None, **expected_values):
        try:
            self.updatedAt = datetime.now().astimezone()
            logger.debug('saving: {}'.format(self))
            super(AssetModel, self).save()
        except Exception as e:
            logger.error('save {} failed: {}'.format(self.asset_id, e), exc_info=True)
            raise e

    def __iter__(self):
        for name, attr in self._get_attributes().items():
            yield name, attr.serialize(getattr(self, name))

    def get_upload_url(self, ttl=60):
        """
        :param ttl: url duration in seconds
        :return: a temporary presigned PUT url
        """
        s3 = boto3.client('s3')
        put_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET,
                'Key': self.get_key()
            },
            ExpiresIn=ttl,
            HttpMethod='PUT'
        )
        logger.debug('upload URL: {}'.format(put_url))
        return put_url

    def get_download_url(self, ttl=60):
        """
        :param ttl: url duration in seconds
        :return: a temporary presigned download url
        """
        s3 = boto3.client('s3')
        if self.state != State.UPLOADED.name:
            raise AssertionError(
                'Asset {} is marked as {}, must be marked {} to retrieve.'.format(
                    self.asset_id, self.state, State.UPLOADED.name
                )
            )
        get_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': BUCKET,
                'Key': self.get_key(),
            },
            ExpiresIn=ttl,
            HttpMethod='GET'
        )
        logger.debug('download URL: {}'.format(get_url))
        return get_url

    def mark_received(self):
        """
        Mark asset as having been received via the s3 objectCreated:Put event
        """
        self.state = State.RECEIVED.name
        logger.debug('mark asset received: {}'.format(self.asset_id))
        self.save()

    def mark_uploaded(self):
        """
        Mark asset as having been uploaded via a PUT to the asset's REST path
        """
        uploaded_states = [State.RECEIVED.name, State.UPLOADED.name]
        if self.state not in uploaded_states:
            raise AssertionError('State: \"{}\" must be one of {}'.format(self.state, uploaded_states))
        self.state = State.UPLOADED.name
        logger.debug('mark asset uploaded: {}'.format(self.asset_id))
        self.save()

    def mark_deleted(self):
        """
        Mark asset as deleted (soft delete)
        """
        self.state = State.DELETED.name
        logger.debug('mark asset deleted: {}'.format(self.asset_id))
        self.save()

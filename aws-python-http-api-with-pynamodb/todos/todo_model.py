import os
from datetime import datetime

from pynamodb.attributes import UnicodeAttribute, BooleanAttribute, UTCDateTimeAttribute
from pynamodb.models import Model


class TodoModel(Model):
    class Meta:
        table_name = os.environ['DYNAMODB_TABLE']
        region = 'us-east-1'
        if 'ENV' in os.environ:
            host = 'http://localhost:8000'
        else:
            host = 'https://dynamodb.us-east-1.amazonaws.com'

    todo_id = UnicodeAttribute(hash_key=True, null=False)
    text = UnicodeAttribute(null=False)
    checked = BooleanAttribute(null=False)
    # `default` must be a callable so each instance gets its own timestamp
    # (pynamodb>=6 requires immutable-or-callable defaults; a bare
    # `datetime.now()` here would be evaluated once at class-definition time
    # and shared by every instance).
    createdAt = UTCDateTimeAttribute(null=False, default=datetime.now)
    updatedAt = UTCDateTimeAttribute(null=False)

    def save(self, conditional_operator=None, **expected_values):
        self.updatedAt = datetime.now()
        super(TodoModel, self).save()

    def __iter__(self):
        for name, attr in self.get_attributes().items():
            yield name, attr.serialize(getattr(self, name))

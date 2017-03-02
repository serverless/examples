import json
import logging
import os

from faunadb.client import FaunaClient
from faunadb.objects import Ref
from faunadb import query

client = FaunaClient(secret=os.environ['FAUNADB_SECRET'])

TODOS = Ref('classes/todos')
ALL_TODOS = query.index('all_todos')

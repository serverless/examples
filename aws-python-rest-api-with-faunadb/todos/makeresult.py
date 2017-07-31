import time

def _to_epoch(fauna_time):
    return int(time.mktime(fauna_time.to_datetime().timetuple()) * 1000)

def make_result(value):
    return {
        'id': value['ref'].id(),
        'text': value['data']['text'],
        'checked': value['data']['checked'],
        'createdAt': _to_epoch(value['data']['createdAt']),
        'updatedAt': _to_epoch(value['data']['updatedAt'])
    }

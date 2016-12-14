import random


def parseInt(value):
    try:
        return int(value)
    except ValueError:
        return 100


def lucky_number(event, context):
    print(event)
    upperLimitDict = event['request']['intent']['slots']['UpperLimit']
    upperLimit = None
    if 'value' in upperLimitDict:
        upperLimit = parseInt(upperLimitDict['value'])
    else:
        upperLimit = 100

    number = random.randint(0, upperLimit)
    response = {
        'version': '1.0',
        'response': {
            'outputSpeech': {
                'type': 'PlainText',
                'text': 'Your lucky number is ' + str(number),
            }
        }
    }

    return response

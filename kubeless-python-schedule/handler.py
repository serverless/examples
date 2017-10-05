from datetime import datetime
def printClock():
    now = datetime.now()
    clock = "%02d:%02d" % (now.hour,now.minute)
    print clock
    return clock

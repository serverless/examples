def hello(request):
    name = request.body.getvalue()
    return "Hello " + name + "!"


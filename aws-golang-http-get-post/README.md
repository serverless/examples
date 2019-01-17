# Serverless-golang http Get and Post Example
Serverless boilerplate code for golang with GET and POST example

This example is using AWS Request and Response Proxy Model, provided by AWS itself.
If you want to test any changes don't forget to run `make` inside the service directory.

There are two endpoint provided:
1. GET endpoint with name parameter (/get/{name})
2. POST endpoint with name in the body (/post - with JSON body {"name":$name}

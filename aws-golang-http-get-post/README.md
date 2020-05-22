<!--
title: .'HTTP GET and POST'
description: 'Boilerplate code for Golang with GET and POST example'
framework: v1
platform: AWS
language: Go
authorLink: 'https://github.com/pramonow'
authorName: 'Pramono Winata'
authorAvatar: 'https://avatars0.githubusercontent.com/u/28787057?v=4&s=140'
-->

# Serverless-golang http Get and Post Example
Serverless boilerplate code for golang with GET and POST example

This example is using AWS Request and Response Proxy Model, provided by AWS itself.
If you want to test any changes don't forget to run `make` inside the service directory.

There are three endpoint provided:
1. GET endpoint with name parameter (/get/{name})
2. GET endpoint with query string parameter (getQ?name=$name)
3. POST endpoint with name in the body (/post - with JSON body {"name":$name}

<!--
title: 'aws-golang-rest-api-with-dynamodb'
description: 'Boilerplate code for Golang CRUD Operations'
framework: v1
platform: AWS
language: Go
authorLink: 'https://github.com/gsweene2'
authorName: 'Garrett Sweeney'
authorAvatar: 'https://avatars.githubusercontent.com/u/14845943?s=400&u=6d79e8f042cd3d30643ba4598515cae24be69ec3&v=4'
-->
# aws-golang-rest-api-with-dynamodb

Build & Deploy
```
make deploy
```

# CRUD Operations

## Create

```
curl --request POST \
  --url https://fz3n8nstdf.execute-api.us-east-1.amazonaws.com/dev/todos \
  --header 'Content-Type: application/json' \
  --data '{
  "Title": "Walk the Dog",
  "Details": "Complete before 11am"
}'

curl --request POST \
  --url https://fz3n8nstdf.execute-api.us-east-1.amazonaws.com/dev/todos \
  --header 'Content-Type: application/json' \
  --data '{
  "Title": "Mow the Lawn",
  "Details": "Remember to buy gas"
}'
```

## Read

```
curl --request GET \
  --url https://fz3n8nstdf.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
```

## Update

```
curl --request PUT \
  --url https://fz3n8nstdf.execute-api.us-east-1.amazonaws.com/dev/todos/0d2263b7-c62d-4df6-8503-bb16ee8dd81 \
  --header 'Content-Type: application/json' \
  --data '{
  "title": "Updated title",
  "details": "Updated details"
}'
```

## List

```
curl --request GET \
  --url https://fz3n8nstdf.execute-api.us-east-1.amazonaws.com/dev/todos
```


## Delete

```
curl --request DELETE \
  --url https://fz3n8nstdf.execute-api.us-east-1.amazonaws.com/dev/todos/0d2263b7-c62d-4df6-8503-bb16ee8dd81
```

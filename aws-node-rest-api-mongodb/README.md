# Serverless MongoDB Rest API with Mongoose and Bluebird Promises

This example demonstrate how to use a MongoDB database with aws and serverless.

Using Mongoose ODM and Bluebird for Promises.

## Use Cases

- NoSQL CRUD API

## Setup

```
npm install
serverless deploy
```

## Usage

In `handler.js` update the `mongoString` with your mongoDB url.

*Create*

```bash
curl -XPOST -H "Content-type: application/json" -d '{
   "name" : "John",
   "firstname" : "Doe",
   "city" : "Toronto",
   "birth" : "01/01/1990"
}' 'https://2c8cx5whk0.execute-api.us-east-1.amazonaws.com/dev/user/'
```
```json
{"id": "590b52ff086041000142cedd"}
```

*READ*

```bash
curl -XGET -H "Content-type: application/json" 'https://2c8cx5whk0.execute-api.us-east-1.amazonaws.com/dev/user/590b52ff086041000142cedd'
```
```json
[
  {
    "_id": "5905e2fbdb55f20001334b3e",
    "name": "John",
    "firstname": "Doe",
    "birth": null,
    "city": "Toronto",
    "ip": "01/01/1990",
    "__v": 0
  }
]
```

*UPDATE*

```bash
curl -XPUT -H "Content-type: application/json" -d '{
   "name" : "William",
   "firstname" : "Smith",
   "city" : "Miami",
   "birth" : "01/01/2000"
}' 'https://2c8cx5whk0.execute-api.us-east-1.amazonaws.com/dev/user/590b52ff086041000142cedd'
```
```json
"Ok"
```

*DELETE*

```bash
curl -XDELETE -H "Content-type: application/json" 'https://2c8cx5whk0.execute-api.us-east-1.amazonaws.com/dev/user/590b52ff086041000142cedd'
```

```json
"Ok"
```

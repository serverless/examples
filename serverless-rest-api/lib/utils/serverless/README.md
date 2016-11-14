# Serverless Helper Library

Work In Progress/Experimental – This library makes serverless functions easier to use.

## Goals

* Provide two standard function handlers for synchronous and asynchronous functions that work across providers.
* Provide a standard way to load in environment variables and configuration files.
* Improve the serverless functions user experience.

## Serverless Function - Synchronous Handler

### `serverless.sync()`

The universal handler for *synchronous* functions across providers.  Use this for your function handler and your function will have `req` and `res` properties.

```
const serverless = require('serverless);
serverless.init();

// Function
const myFunction = (req, res) => {
  console.log('Successfully received data: `, req.body);
  res.status(200).cors().body({ message: 'success!' }).end();
}

// Function handler
module.exports = serverless.sync(myFunction)
```

### `req`

An instance of the Request class.  This is auto-populated with the request data.  Here is a list of some available properties:

* `req.body`
* `req.path`
* `req.method`
* `req.headers`
* `req.ip`
* `req.userAgent`
* `req.query`

### `res`

An instance of the Response class.  This comes with express-like convenience methods, like these:

```
res.status(500).body({ message: 'something went wrong' }).headers({}).cors().end()
```

### `res.status(integer)`

Sets the response's HTTP status code via an integer.

### `res.body(obj)`

Sets the response's body.

### `res.headers(obj)`

Sets the response's headers.

### `res.cors()`

Auto-sets the CORS header.

### `res.end()`

Calls the function callback and returns your response.

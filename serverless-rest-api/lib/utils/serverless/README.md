# Serverless Helper Library

Work In Progress/Experimental – This library makes serverless functions easier to use.

## Goals

* Provide a two standard function handlers across providers for synchronous and asynchronous functions
* Provide a universal way to load in environment variables and configuration files
* Improve the serverless functions user experience.

## API Reference

### Synchronous Serverless Functions

#### `serverless.sync()`

The universal handler for *synchronous* functions across providers.  Use this for your function handler, like this:

```
// Function handler file

const serverless = require('serverless);
const myFunction = require('./myFunction);

serverless.init();

// Function handler
module.exports = serverless.sync(myFunction)
```

Your function will then have `req` and `res` parameters, which you can use like this:

```
// myFunction.js

exports.module = (req, res) => {
  console.log('Successfully received data: `, req.body);
  res.status(200).cors().body({ message: 'success!' }).end();
}
```

#### `req`

An instance of the Request class.  This is auto-populated with the request data.  Here is a list of some available properties:

* `req.body`
* `req.path`
* `req.method`
* `req.headers`
* `req.ip`
* `req.userAgent`
* `req.query`

#### `res`

An instance of the Response class.  This comes with express-like convenience methods, like these:

```
res.status(500).body({ message: 'something went wrong' }).headers({}).cors().end()
```

#### `res.status(integer)`

Sets the response's HTTP status code via an integer.

#### `res.body(obj)`

Sets the response's body.

#### `res.headers(obj)`

Sets the response's headers.

#### `res.cors()`

Auto-sets the CORS header.

#### `res.end()`

Calls the function callback and returns your response.

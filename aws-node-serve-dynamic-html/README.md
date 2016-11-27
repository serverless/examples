# Serving Dynamic HTML via API Gateway Example

These examples illustrate how to hookup an API Gateway endpoint to a Lambda function to render HTML on a `GET` request.

Instead of returning the default `json` from requests to an endpoint, you can display custom dynamic HTML by setting the `Content-Type` header.

```js
const response = {
  statusCode: 200,
  headers: {
    'Content-Type': 'text/html',
  },
  body: html,
};
// callback will send HTML back
callback(null, response);
```

## Use-cases

- landing pages for marketing activities
- dynamic single use webpages
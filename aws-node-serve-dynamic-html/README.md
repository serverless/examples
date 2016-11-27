# Serving Dynamic HTML via API Gateway Example

This example illustrates how to hookup an API Gateway endpoint to a Lambda function to render HTML on a `GET` request.

Instead of returning the default `json` from a request, you can display custom dynamic HTML by setting the `Content-Type` header to `text/html`.

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

- Landing pages for marketing activities
- Single use dynamic webpages
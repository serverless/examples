# Go Serverless Examples

A few example of AWS lambda functions written in GoLang.

Functions:

- `hello-world`: Exactly what is says on the tin. Listening on a `/hello` path.
- `auth`: An AWS API Gateway custom authorizer that sits in front of `hello-world`. It expects an auth bearer of `hello` as a header and is on the base `/` path. The auth header should be `Authorization: bearer hello`
- `auth2` and `hello-world2`: The same as `auth` above except using auth contexts. Any name can be used as a bearer token, for example `Authorization: bearer Bob`. The response will then return `Hello, Bob!`

I hope to add to these examples over time, if you have ideas please feel free to raise issues or pull requests.

For more info on these example check out the [blog post](https://cloudnative.ly/lambdas-with-golang-a-technical-guide-6f381284897b)

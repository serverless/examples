# Post to facebook serverless Example

A Serverless example for posting status updates to Facebook. It exposes a HTTP POST endpoint. For simplicity I've added the access token in the event, but this should be stored as an environment variable on the server. If you wish to use this example please modify.
The HTTP endpoint is exposed as `postFb`.

## Use Cases

- Showcase how to split functionalities of your monolith app as a serverless function.

## Invoke the function locally

```bash
serverless invoke local --function postFb --path eventTest.json
```

## Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy
```

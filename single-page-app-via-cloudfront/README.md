# Single Page Application

This example demonstrates how to setup a Single Page Application. Our goals here are to serve a static page with low latency. One additional goal is to make sure the client side application can leverage the History API functions `pushState` and `replaceState` to change the current URL without reloading.

To achieve these goals we use S3 in combination with CloudFront. S3 is used to store our static HTML file while CloudFront is responsible for making it available via Amazon's Content Delivery Network.

## Setup

```bash
npm install
```

TODO add a config file

# Deploy

Warning: Whenever you making changes to CloudFront resource in `serverless.yml` the deployment might take a while e.g 15-20 minutes.

TODO get the urls

explain this is for maximum simplicity

improvements you can do:
- bucket restriction
- domain Aliases
- logging

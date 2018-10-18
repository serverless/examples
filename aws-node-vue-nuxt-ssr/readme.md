# Serverless-side rendering with Vue.js and Nuxt.js

This project demonstrates how to use Nuxt.js to create a server-side rendered Vue.js app on AWS Lambda and AWS API Gateway. 

## Use-cases
- Develop single-page apps without worrying about SEO optimization.

## Benefits
- SEO boost server-side rendering provides
- Speed of a Single Page Application\
- Cheap hosting in a serverless environment on AWS Lambda
- Easy deployment with the Serverless Framework
- Can easily integrate with your own API or 3rd party APIs such as headless CMS, e-commerce or serverless architecture.

## How it works
Well, first thing's first. We want a super fast Single Page Application. But, this usually comes with a cost. Lousy SEO capabilities. That won't do, meaning we also want the app to have server-side rendering. Okay, sounds simple. We'll grab Nuxt.js, which is a framework for creating universal Vue.js applications, and configure it to server-side render our pages.

To accomplish this we need to spin up a simple Express server and configure the Nuxt renderer to serve files through Express. It is way simpler than it sounds.

## Setup
- Install dependencies:
    ```bash
    $ npm i
    ```
- [Create public wildcard certificate](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html) for your domain (AWS ACM)

## Deploy
1. **Deploy service without custom domain:**
    
    ```bash
    $ sls deploy
    ```

    Once deployed you'll have your app running on a default API Gateway URI.

2. **Create domain:**

    Uncomment domain settings in `serverless.yaml`.
    ```yaml
    [...]
    plugins:
      - serverless-apigw-binary
      - serverless-domain-manager # uncomment the plugin
      - serverless-offline
    [...]
    custom:
      secrets: ${file(secrets.json)}
      apigwBinary:
        types:
          - '*/*'
      customDomain: # uncomment the whole customDomain section
        domainName: ${self:custom.secrets.DOMAIN}
        basePath: ''
        stage: ${self:custom.secrets.NODE_ENV}
        createRoute53Record: true
    ```

    Run the create domain command:
    ```bash
    $ sls create_domain
    ```
    This will take a few minutes, go grab a coffee in the meantime. :smile:

3. **Re-deploy the service with the domain settings:**

    ```bash
    $ sls deploy
    ```

    Output:
    ```bash

    ```


## Usage
Navigate to `vuessr-yourdomain.com` or whichever domain you picked. You'll se the Vue.js SPA running.

--- 

I've written a detailed tutorial about the process. You can check it out [here](https://dev.to/adnanrahic/a-crash-course-on-serverless-side-rendering-with-vuejs-nuxtjs-and-aws-lambda-1nk4).

<!--
title: 'Serverless-side rendering with Vue.js and Nuxt.js'
description: 'This project demonstrates how to use Nuxt.js to create a server-side rendered Vue.js app on AWS Lambda and AWS API Gateway.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/adnanrahic'
authorName: adnanrahic
authorAvatar: 'https://avatars1.githubusercontent.com/u/15029531?s=400&v=4'
-->
# Serverless-side rendering with Vue.js and Nuxt.js

This project demonstrates how to use Nuxt.js to create a server-side rendered Vue.js app on AWS Lambda and AWS API Gateway.

## Use-cases
- Develop single-page apps without worrying about SEO optimization.

## Benefits
- SEO boost server-side rendering provides
- Speed of a Single Page Application
- Cheap hosting in a serverless environment on AWS Lambda
- Easy deployment with the Serverless Framework
- Can easily integrate with your own API or 3rd party APIs such as headless CMS, e-commerce or serverless architecture.

## How it works
Well, first thing's first. We want a super fast Single Page Application. But, this usually comes with a cost. Lousy SEO capabilities. That won't do, meaning we also want the app to have server-side rendering. Okay, sounds simple. We'll grab Nuxt.js, which is a framework for creating universal Vue.js applications, and configure it to server-side render our pages.

To accomplish this we need to spin up a simple Express server and configure the Nuxt renderer to serve files through Express. It is way simpler than it sounds.

## Setup
- Install dependencies:
    ```bash
    $ npm install
    ```
- [Create public wildcard certificate](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html) for your domain (AWS ACM)

## Deploy
1. **Deploy service without custom domain:**

    ```bash
    $ npm run deploy
    ```

    Output:
    ```bash

    > aws-node-vue-nuxt-ssr@1.0.0 deploy /home/raha/code/serverless/examples/aws-node-vue-nuxt-ssr
    > npm run build && sls deploy


    > aws-node-vue-nuxt-ssr@1.0.0 build /home/raha/code/serverless/examples/aws-node-vue-nuxt-ssr
    > nuxt build

    Hash: 969f557230f1916aaab2
    Version: webpack 4.31.0
    Time: 5531ms
    Built at: 05/14/2019 12:22:28 AM
                            Asset       Size  Chunks             Chunk Names
    ../server/client.manifest.json   6.81 KiB          [emitted]
        1aeb026dc2ca77c8b429.js  952 bytes       3  [emitted]  pages/dogs/index
        775caefedab77dd6e1a6.js    147 KiB       1  [emitted]  commons.app
        92fcd17f0b85f40f90ad.js   1.15 KiB       2  [emitted]  pages/dogs/_breed
        9f5aaac1c101c273e65f.js  845 bytes       4  [emitted]  pages/index
                        LICENSES  464 bytes          [emitted]
        cf8b2abbbaec4a0c7b76.js   2.27 KiB       5  [emitted]  runtime
        fa6324eac05d1b7d36b0.js   42.3 KiB       0  [emitted]  app
    + 2 hidden assets
    Entrypoint app = cf8b2abbbaec4a0c7b76.js 775caefedab77dd6e1a6.js fa6324eac05d1b7d36b0.js

    Hash: ac61088f50920f2fc1a4
    Version: webpack 4.31.0
    Time: 1266ms
    Built at: 05/14/2019 12:22:30 AM
                    Asset       Size  Chunks             Chunk Names
    92cd2f7d0e5f9c484439.js  641 bytes       2  [emitted]  pages/dogs/index
    bbeb65244f57ade7cfbe.js  828 bytes       1  [emitted]  pages/dogs/_breed
    e3465bc88d2bf9e1b91d.js  536 bytes       3  [emitted]  pages/index
                server.js   25.1 KiB       0  [emitted]  app
    server.manifest.json  483 bytes          [emitted]
    + 4 hidden assets
    Entrypoint app = server.js server.js.map
    Done in 9.03s

    Serverless: Packaging service...
    Serverless: Excluding development dependencies...
    Serverless: Creating Stack...
    Serverless: Checking Stack create progress...
    .....
    Serverless: Stack create finished...
    Serverless: Uploading CloudFormation file to S3...
    Serverless: Uploading artifacts...
    Serverless: Uploading service .zip file to S3 (42.47 MB)...
    Serverless: Validating template...
    Serverless: Updating Stack...
    Serverless: Checking Stack update progress...
    .................................
    Serverless: Stack update finished...
    Service Information
    service: serverless-side-rendering-vue-nuxt
    stage: dev
    region: us-east-1
    stack: serverless-side-rendering-vue-nuxt-dev
    api keys:
        None
    endpoints:
        ANY - https://<api_id>.execute-api.us-east-1.amazonaws.com/dev
        ANY - https://<api_id>.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
    functions:
        nuxt: serverless-side-rendering-vue-nuxt-dev-nuxt

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
    $ npm run deploy
    ```

    Output:
    ```bash
    [...same as above but also with the domain info]
    Serverless Domain Manager Summary
    Domain Name
        vuessr.yourdomain.com
    Distribution Domain Name
        <cdn_id>.cloudfront.net
    ```


## Usage
Navigate to `vuessr-yourdomain.com` or whichever domain you picked. You'll see the Vue.js SPA running.

---

I've written a detailed tutorial about the process. You can check it out [here](https://dev.to/adnanrahic/a-crash-course-on-serverless-side-rendering-with-vuejs-nuxtjs-and-aws-lambda-1nk4). (**NOTE:** Some parts are outdated and are for `nuxt@1`. Please refer to this example for using with `nuxt@2`)

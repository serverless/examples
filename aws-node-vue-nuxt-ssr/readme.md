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

    nuxt:build Building... +0ms
    nuxt:build App root: /home/raha/code/serverless/examples/aws-node-vue-nuxt-ssr/client +0ms
    nuxt:build Generating /home/raha/code/serverless/examples/aws-node-vue-nuxt-ssr/.nuxt files... +0ms
    nuxt:build Generating files... +40ms
    nuxt:build Generating routes... +7ms
    nuxt:build Building files... +24ms
    ████████████████████ 100% 

    Build completed in 9.783s

    DONE  Compiled successfully in 9788m                                             01:29:34

    Hash: 14102c197254534940dd
    Version: webpack 3.12.0
    Time: 9788ms
                                        Asset       Size  Chunks             Chunk Names
      layouts/default.c7117c4874fb943756b1.js    1.09 kB       0  [emitted]  layouts/default
          pages/index.d3fbe26b313c4e3e99b3.js    1.03 kB       1  [emitted]  pages/index
     pages/dogs/index.471f8b183d02e42ba618.js    1.18 kB       2  [emitted]  pages/dogs/index
    pages/dogs/_breed.4c44d20092b1baf42153.js    1.36 kB       3  [emitted]  pages/dogs/_breed
               vendor.e2344f1165d5e54cb7a2.js     157 kB       4  [emitted]  vendor
                  app.b0ef47f34aef4d684198.js    27.7 kB       5  [emitted]  app
             manifest.14102c197254534940dd.js    1.56 kB       6  [emitted]  manifest
                                     LICENSES  705 bytes          [emitted]  
    
    + 3 hidden assets
    Hash: 3be2c5d3c65a2d58b155
    Version: webpack 3.12.0
    Time: 507ms
    
    Asset               Size            Chunks             Chunk Names
    server-bundle.json  130 kB          [emitted]  
    
    nuxt:build Building done +11s

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

I've written a detailed tutorial about the process. You can check it out [here](https://dev.to/adnanrahic/a-crash-course-on-serverless-side-rendering-with-vuejs-nuxtjs-and-aws-lambda-1nk4).

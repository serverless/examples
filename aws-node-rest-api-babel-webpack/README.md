# Serverless + Webpack + Babel Sample
---

![badgen](https://badgen.net/badge/built%20with/love/red)
![badgen](https://badgen.net/badge/built%20with/javascript/yellow)
[![serverless](https://camo.githubusercontent.com/547c6da94c16fedb1aa60c9efda858282e22834f/687474703a2f2f7075626c69632e7365727665726c6573732e636f6d2f6261646765732f76332e737667)](http://www.serverless.com)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/0c62da09be11447b9427e85176e70a89)](https://www.codacy.com/gh/pcrodrigues0/serverless-babel-webpack/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=pcrodrigues0/serverless-babel-webpack&amp;utm_campaign=Badge_Grade)
![GitHub last commit](https://img.shields.io/github/last-commit/pcrodrigues0/serverless-babel-webpack)
[![Made By](https://img.shields.io/badge/made%20by-Paulo%20Rodrigues-blue)](https://www.linkedin.com/in/pcqrodrigues/)
---
#### Setup
You need to:
* [Configure the aws credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
* [Serverless framework](https://serverless.com) installed.
* [Node.js](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/) or [Npm](https://www.npmjs.com/)

### To Test It Locally 💻

* Run ```npm install``` or ```yarn``` to install all the necessary dependencies.
* Run ```npm start:local``` or ```yarn start:local``` use serverless offline to test locally. 

The expected result should be similar to:

```
Serverless: Bundling with Webpack...
Time: 659ms
Built at: 10/27/2020 7:18:32 PM
           Asset      Size     Chunks                   Chunk Names
    src/index.js  5.99 KiB  src/index  [emitted]        src/index
src/index.js.map  4.58 KiB  src/index  [emitted] [dev]  src/index
Entrypoint src/index = src/index.js src/index.js.map
[./src/helpers/response.js] 238 bytes {src/index} [built]
[./src/index.js] 209 bytes {src/index} [built]
[source-map-support/register] external "source-map-support/register" 42 bytes {src/index} [built]
Serverless: Watching for changes...
offline: Starting Offline: local/us-east-1.
offline: Offline [http for lambda] listening on http://localhost:3002

   ┌────────────────────────────────────────────────────────────────────────────┐
   │                                                                            │
   │   GET | http://localhost:3000/local/test                                   │
   │   POST | http://localhost:3000/2015-03-31/functions/getTeste/invocations   │
   │                                                                            │
   └────────────────────────────────────────────────────────────────────────────┘

offline: [HTTP] server ready: http://localhost:3000 🚀
offline: 
offline: Enter "rp" to replay the last request
```

### Deploy on AWS 🚀

```
$ npm run deploy:{yourStage}
```
or
```
$ yarn deploy:{yourStage}
```

## Usage 🎉

send an HTTP request directly to the endpoint using a tool like curl

```
curl https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/{stage}/test
```

## Scaling 🔝

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).
